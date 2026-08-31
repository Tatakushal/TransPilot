from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from database import get_db
from auth_models import UserAccountModel, AuthTokenModel
from auth_security import hash_password, verify_password, create_token, token_hash
from authorization import current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALLOWED_ROLES = {"fleet-manager", "dispatcher", "safety-officer", "financial-analyst"}

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="fleet-manager", min_length=3, max_length=40)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str

class MessageResponse(BaseModel):
    message: str
    token: str | None = None

@router.post("/register", response_model=MessageResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(400, "Invalid account role")
    if db.query(UserAccountModel).filter(UserAccountModel.email == email).first():
        raise HTTPException(409, "An account with this email already exists")
    user = UserAccountModel(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(user); db.commit(); db.refresh(user)
    raw = create_token()
    db.add(AuthTokenModel(user_id=user.id, token_hash=token_hash(raw), token_type="email_verification", expires_at=datetime.utcnow() + timedelta(hours=24)))
    db.commit()
    return {"message": "Account created. Verify your email to activate it.", "token": raw}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserAccountModel).filter(UserAccountModel.email == payload.email.lower()).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    if not user.email_verified:
        raise HTTPException(403, "Email verification required")
    raw = create_token()
    db.add(AuthTokenModel(user_id=user.id, token_hash=token_hash(raw), token_type="access", expires_at=datetime.utcnow() + timedelta(hours=12)))
    db.commit()
    return {"access_token": raw, "user_id": user.id, "role": user.role}

@router.post("/verify-email", response_model=MessageResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    row = db.query(AuthTokenModel).filter(AuthTokenModel.token_hash == token_hash(token), AuthTokenModel.token_type == "email_verification", AuthTokenModel.used == False).first()
    if not row or row.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired verification token")
    user = db.get(UserAccountModel, row.user_id)
    if not user:
        raise HTTPException(404, "Account not found")
    user.email_verified = True; row.used = True; row.used_at = datetime.utcnow(); db.commit()
    return {"message": "Email verified successfully"}

@router.post("/request-password-reset", response_model=MessageResponse)
def request_password_reset(email: EmailStr, db: Session = Depends(get_db)):
    user = db.query(UserAccountModel).filter(UserAccountModel.email == email.lower()).first()
    if not user:
        return {"message": "If the account exists, a reset link has been issued."}
    raw = create_token()
    db.add(AuthTokenModel(user_id=user.id, token_hash=token_hash(raw), token_type="password_reset", expires_at=datetime.utcnow() + timedelta(minutes=30)))
    db.commit()
    return {"message": "If the account exists, a reset link has been issued."}

class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    row = db.query(AuthTokenModel).filter(AuthTokenModel.token_hash == token_hash(payload.token), AuthTokenModel.token_type == "password_reset", AuthTokenModel.used == False).first()
    if not row or row.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired reset token")
    user = db.get(UserAccountModel, row.user_id)
    if not user or not user.is_active:
        raise HTTPException(404, "Account not found")
    user.password_hash = hash_password(payload.password); row.used = True; row.used_at = datetime.utcnow(); db.commit()
    return {"message": "Password reset successfully"}

@router.delete("/account", response_model=MessageResponse)
def delete_account(user=Depends(current_user), db: Session = Depends(get_db)):
    user.is_active = False
    db.query(AuthTokenModel).filter(AuthTokenModel.user_id == user.id).update({"used": True})
    db.commit()
    return {"message": "Account deactivated"}
