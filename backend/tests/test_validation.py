import pytest
from app.core.validation import (
    validate_email,
    validate_password,
    sanitize_text,
    validate_uuid
)
from fastapi import HTTPException
import uuid


class TestEmailValidation:
    """Test email validation."""
    
    def test_valid_email(self):
        """Test valid email addresses."""
        assert validate_email("user@example.com") == "user@example.com"
        assert validate_email("test.user@domain.co.uk") == "test.user@domain.co.uk"
    
    def test_email_lowercase(self):
        """Test email is converted to lowercase."""
        assert validate_email("USER@EXAMPLE.COM") == "user@example.com"
    
    def test_invalid_email_format(self):
        """Test invalid email formats."""
        with pytest.raises(HTTPException) as exc:
            validate_email("not-an-email")
        assert exc.value.status_code == 400


class TestPasswordValidation:
    """Test password validation."""
    
    def test_valid_password(self):
        """Test valid passwords."""
        validate_password("SecurePass123")
        validate_password("MyP@ssw0rd")
    
    def test_password_too_short(self):
        """Test password minimum length."""
        with pytest.raises(HTTPException) as exc:
            validate_password("Short1")
        assert exc.value.status_code == 400
        assert "8 characters" in exc.value.detail
    
    def test_password_no_uppercase(self):
        """Test password requires uppercase."""
        with pytest.raises(HTTPException) as exc:
            validate_password("lowercase123")
        assert "uppercase" in exc.value.detail.lower()
    
    def test_password_no_number(self):
        """Test password requires number."""
        with pytest.raises(HTTPException) as exc:
            validate_password("NoNumbers")
        assert "number" in exc.value.detail.lower()


class TestTextSanitization:
    """Test text sanitization."""
    
    def test_sanitize_normal_text(self):
        """Test sanitizing normal text."""
        result = sanitize_text("Hello World", max_length=100)
        assert result == "Hello World"
    
    def test_sanitize_strips_whitespace(self):
        """Test whitespace trimming."""
        result = sanitize_text("  Hello World  ", max_length=100)
        assert result == "Hello World"
    
    def test_sanitize_removes_html_tags(self):
        """Test HTML tag removal."""
        result = sanitize_text("<script>alert('xss')</script>Hello", max_length=100)
        assert "<script>" not in result
        assert "Hello" in result
    
    def test_sanitize_max_length(self):
        """Test text truncation raises error."""
        with pytest.raises(HTTPException) as exc:
            sanitize_text("a" * 100, max_length=50)
        assert exc.value.status_code == 400
        assert "exceeds" in exc.value.detail.lower()
    
    def test_sanitize_empty_string(self):
        """Test empty string handling."""
        result = sanitize_text("", max_length=100)
        assert result == ""
    
    def test_sanitize_none_value(self):
        """Test None value handling."""
        result = sanitize_text(None, max_length=100)
        assert result == ""


class TestUUIDValidation:
    """Test UUID validation."""
    
    def test_valid_uuid(self):
        """Test valid UUID."""
        test_uuid = uuid.uuid4()
        result = validate_uuid(test_uuid)
        assert result == test_uuid
    
    def test_valid_uuid_string(self):
        """Test valid UUID string."""
        test_uuid = uuid.uuid4()
        result = validate_uuid(str(test_uuid))
        assert isinstance(result, uuid.UUID)
    
    def test_invalid_uuid_string(self):
        """Test invalid UUID string returns False."""
        result = validate_uuid("not-a-uuid")
        assert result is False
    
    def test_invalid_uuid_type(self):
        """Test invalid UUID type returns False."""
        result = validate_uuid(12345)
        assert result is False