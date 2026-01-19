import pytest
from fastapi import status
from io import BytesIO
from PIL import Image
import uuid
from app.models import User, ScentMemory

class TestUploadMemory:
    """Test memory upload endpoint."""
    
    def test_upload_text_memory(self, client, auth_headers, mock_celery):
        """Test uploading text-only memory."""
        response = client.post(
            "/api/memories/upload",
            headers=auth_headers,
            data={
                "title": "Beach Day",
                "content": "Wonderful day at the beach with coconut sunscreen",
                "occasion": "vacation",
                "emotion": "happy"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Beach Day"
        assert data["status"] == "processing"
        assert "id" in data
        mock_celery.assert_called_once()
    
    def test_upload_with_image(self, client, auth_headers, mock_celery):
        """Test uploading memory with image."""
        # Create test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = client.post(
            "/api/memories/upload",
            headers=auth_headers,
            data={
                "title": "Perfume Bottle",
                "content": "My favorite perfume",
                "emotion": "nostalgic"
            },
            files={"file": ("test.jpg", img_bytes, "image/jpeg")}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "processing"
        mock_celery.assert_called_once()
    
    def test_upload_file_too_large(self, client, auth_headers):
        """Test uploading file exceeding size limit."""

        large_file = BytesIO(b"x" * (11 * 1024 * 1024))
        
        response = client.post(
            "/api/memories/upload",
            headers=auth_headers,
            data={
                "title": "Test",
                "content": "Test content"
            },
            files={"file": ("large.jpg", large_file, "image/jpeg")}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "too large" in response.json()["detail"].lower()
    
    def test_upload_unsupported_file_type(self, client, auth_headers):
        """Test uploading unsupported file type."""
        file = BytesIO(b"test content")
        
        response = client.post(
            "/api/memories/upload",
            headers=auth_headers,
            data={
                "title": "Test",
                "content": "Test content"
            },
            files={"file": ("test.txt", file, "text/plain")}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "unsupported" in response.json()["detail"].lower()
    
    def test_upload_without_auth(self, client):
        """Test uploading without authentication."""
        response = client.post(
            "/api/memories/upload",
            data={
                "title": "Test",
                "content": "Test content"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_upload_sanitizes_input(self, client, auth_headers, mock_celery):
        """Test input sanitization."""
        response = client.post(
            "/api/memories/upload",
            headers=auth_headers,
            data={
                "title": "<script>alert('xss')</script>Beach Day",
                "content": "Normal content",
                "occasion": "<b>vacation</b>",
            }
        )
        assert response.status_code == status.HTTP_200_OK


class TestListMemories:
    """Test listing memories endpoint."""
    
    def test_list_memories_success(self, client, auth_headers, test_memory):
        """Test retrieving user's memories."""
        response = client.get("/api/memories/", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["title"] == test_memory.title
    
    def test_list_memories_empty(self, client, auth_headers):
        """Test listing when user has no memories."""
        response = client.get("/api/memories/", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_list_memories_no_auth(self, client):
        """Test listing memories without authentication."""
        response = client.get("/api/memories/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_memories_order(self, client, auth_headers, db_session, test_user):
        """Test memories are ordered by creation date descending."""

        for i in range(3):
            memory = ScentMemory(
                user_id=test_user.id,
                title=f"Memory {i}",
                content=f"Content {i}",
                memory_type="TEXT"
            )
            db_session.add(memory)
        db_session.commit()
        
        response = client.get("/api/memories/", headers=auth_headers)
        data = response.json()
        

        assert len(data) == 3
        for i in range(len(data) - 1):
            assert data[i]["created_at"] >= data[i + 1]["created_at"]


class TestGetMemory:
    """Test get single memory endpoint."""
    
    def test_get_memory_success(self, client, auth_headers, test_memory):
        """Test retrieving a specific memory."""
        response = client.get(
            f"/api/memories/{test_memory.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(test_memory.id)
        assert data["title"] == test_memory.title
        assert "chunks_count" in data
    
    def test_get_memory_not_found(self, client, auth_headers):
        """Test retrieving non-existent memory."""
        fake_id = uuid.uuid4()
        response = client.get(
            f"/api/memories/{fake_id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_memory_wrong_user(self, client, auth_headers, db_session):
        """Test user cannot access another user's memory."""
        
        
        other_user = User(
            email="other@example.com",
            hashed_password="hash",
            full_name="Other User"
        )
        db_session.add(other_user)
        db_session.commit()
        
        other_memory = ScentMemory(
            user_id=other_user.id,
            title="Other's Memory",
            content="Private content",
            memory_type="TEXT"
        )
        db_session.add(other_memory)
        db_session.commit()
        
        response = client.get(
            f"/api/memories/{other_memory.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_memory_invalid_uuid(self, client, auth_headers):
        """Test with invalid UUID format."""
        response = client.get(
            "/api/memories/not-a-uuid",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY