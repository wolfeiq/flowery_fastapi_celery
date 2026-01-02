import re
from fastapi import HTTPException, Depends
from ..core.config import settings
from ..api.auth import get_current_user
from ..models import User

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.email not in settings.admin_email_list:
        raise HTTPException(403, "Admin access required")
    return current_user