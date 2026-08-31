from functools import wraps
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from database import get_db
from auth_models import UserModel, AuthTokenModel
from auth_security import token_hash

bearer = HTTPBearer(auto_error=False)

ROLE_PERMISSIONS = {
    "admin": {"read", "write", "delete", "manage_users"},
    "fleet-manager": {"read", "write", "delete"},
    "dispatcher": {"read", "write"},
    "safety-officer": {"read", "write"},
    "financial-analyst": {"read"},
}


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    token = db.query(AuthTokenModel).filter(AuthTokenModel.token_hash == token_hash(credentials.credentials), AuthTokenModel.token_type == "access", AuthTokenModel.used_at.is_(None)).first()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    from datetime import datetime, timezone
    expires = token.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    user = db.get(UserModel, token.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is inactive")
    return user


def require_permission(permission: str):
    def dependency(user=Depends(current_user)):
        if permission not in ROLE_PERMISSIONS.get(user.role, set()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return dependency
