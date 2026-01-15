import uuid
from fastapi import HTTPException
import re
from bleach import clean

def sanitize_text(text: str, max_length: int = 10000) -> str:
    if not text:
        return ""

    cleaned = clean(text, tags=[], strip=True)

    if len(cleaned) > max_length:
        raise HTTPException(400, f"Text exceeds {max_length} characters")
    
    return cleaned.strip()

def validate_email(email: str) -> str:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise HTTPException(400, "Invalid email format")
    return email.lower()

def validate_uuid(value):
    try:
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))
    except ValueError:
        return False
    
def validate_password(password: str) -> str:
    if len(password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        raise HTTPException(400, "Password must contain uppercase letter")
    if not re.search(r'[0-9]', password):
        raise HTTPException(400, "Password must contain number")
    return password

