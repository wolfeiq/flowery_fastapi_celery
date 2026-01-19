import pytest
from fastapi import status


class TestRegistration:
    
    def test_register_success(self, client):

        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "full_name": "New User"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert "id" in data
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with existing email."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                "full_name": "Duplicate User"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "not-an-email",
                "password": "SecurePass123!",
                "full_name": "Test User"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_weak_password(self, client):
        """Test registration with weak password."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
                "full_name": "Test User"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestLogin:
    """Test login endpoint."""
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "test@example.com",
                "password": "testpass123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user):
        """Test login with incorrect password."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "test@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_invalid_email_format(self, client):
        """Test login with invalid email format."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "not-an-email",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestGetCurrentUser:
    """Test get current user endpoint."""
    
    def test_get_me_success(self, client, auth_headers, test_user):
        """Test retrieving current user info."""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
    
    def test_get_me_no_token(self, client):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_me_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED