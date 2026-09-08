import os

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from auth_models import UserAccountModel
from auth_security import hash_password
from database import get_db

router = APIRouter(prefix="/bootstrap", tags=["Bootstrap"])


class BootstrapAdminRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=10, max_length=128)


@router.post("/admin", status_code=201)
def bootstrap_admin(payload: BootstrapAdminRequest, x_bootstrap_key: str | None = Header(default=None), db: Session = Depends(get_db)):
    configured_key = os.getenv("ADMIN_BOOTSTRAP_KEY", "").strip()
    if not configured_key or not x_bootstrap_key or x_bootstrap_key != configured_key:
        raise HTTPException(403, "Bootstrap access denied")
    if db.query(UserAccountModel).filter(UserAccountModel.role == "admin").first():
        raise HTTPException(409, "An administrator already exists")
    email = payload.email.lower()
    if db.query(UserAccountModel).filter(UserAccountModel.email == email).first():
        raise HTTPException(409, "An account with this email already exists")
    row = UserAccountModel(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role="admin", email_verified=True, is_active=True)
    db.add(row)
    db.commit()
    return {"message": "Administrator created. Remove or rotate ADMIN_BOOTSTRAP_KEY after first use.", "id": row.id, "email": row.email}
