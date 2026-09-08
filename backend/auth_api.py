from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from database import get_db
from auth_models import UserAccountModel, AuthTokenModel, AuditLogModel
from auth_security import hash_password, verify_password, create_token, token_hash
from authorization import current_user
from admin_api import router as admin_control_router

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
ALLOWED_ROLES = {"admin", "fleet-manager", "dispatcher", "safety-officer", "financial-analyst"}
PUBLIC_ROLES = ALLOWED_ROLES - {"admin"}

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
    name: str
    email: str

class MessageResponse(BaseModel):
    message: str
    token: str | None = None

class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="fleet-manager", min_length=3, max_length=40)

class AdminUserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None

class AdminPasswordUpdate(BaseModel):
    password: str = Field(..., min_length=8, max_length=128)


def _audit(db: Session, actor, action: str, target: str | None = None, details: str | None = None):
    db.add(AuditLogModel(user_id=actor.id, user_email=actor.email, action=action, target=target, details=details))

@router.post("/register", response_model=MessageResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if payload.role not in PUBLIC_ROLES:
        raise HTTPException(400, "Invalid account role")
    if db.query(UserAccountModel).filter(UserAccountModel.email == email).first():
        raise HTTPException(409, "An account with this email already exists")
    user = UserAccountModel(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role=payload.role, email_verified=True, is_active=True)
    db.add(user)
    db.commit()
    return {"message": "Account created successfully. You can now sign in."}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserAccountModel).filter(UserAccountModel.email == payload.email.lower()).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    if not user.email_verified:
        raise HTTPException(403, "Email verification required")
    raw = create_token()
    db.add(AuthTokenModel(user_id=user.id, token_hash=token_hash(raw), token_type="access", expires_at=datetime.utcnow() + timedelta(hours=12)))
    _audit(db, user, "login", "session", "Successful sign in")
    db.commit()
    return {"access_token": raw, "user_id": user.id, "role": user.role, "name": user.name, "email": user.email}

@router.get("/me")
def me(user=Depends(current_user)):
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "is_active": user.is_active}

@router.post("/verify-email", response_model=MessageResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    row = db.query(AuthTokenModel).filter(AuthTokenModel.token_hash == token_hash(token), AuthTokenModel.token_type == "email_verification", AuthTokenModel.used == False).first()
    if not row or row.expires_at < datetime.utcnow(): raise HTTPException(400, "Invalid or expired verification token")
    user = db.get(UserAccountModel, row.user_id)
    if not user: raise HTTPException(404, "Account not found")
    user.email_verified = True; row.used = True; row.used_at = datetime.utcnow(); db.commit()
    return {"message": "Email verified successfully"}

@router.post("/request-password-reset", response_model=MessageResponse)
def request_password_reset(email: EmailStr, db: Session = Depends(get_db)):
    user = db.query(UserAccountModel).filter(UserAccountModel.email == email.lower()).first()
    if user:
        raw = create_token(); db.add(AuthTokenModel(user_id=user.id, token_hash=token_hash(raw), token_type="password_reset", expires_at=datetime.utcnow() + timedelta(minutes=30))); db.commit()
    return {"message": "If the account exists, a reset link has been issued."}

class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    row = db.query(AuthTokenModel).filter(AuthTokenModel.token_hash == token_hash(payload.token), AuthTokenModel.token_type == "password_reset", AuthTokenModel.used == False).first()
    if not row or row.expires_at < datetime.utcnow(): raise HTTPException(400, "Invalid or expired reset token")
    user = db.get(UserAccountModel, row.user_id)
    if not user or not user.is_active: raise HTTPException(404, "Account not found")
    user.password_hash = hash_password(payload.password); row.used = True; row.used_at = datetime.utcnow(); db.commit()
    return {"message": "Password reset successfully"}

@router.delete("/account", response_model=MessageResponse)
def delete_account(user=Depends(current_user), db: Session = Depends(get_db)):
    user.is_active = False; db.query(AuthTokenModel).filter(AuthTokenModel.user_id == user.id).update({"used": True}); _audit(db, user, "account_deactivated", "account"); db.commit()
    return {"message": "Account deactivated"}

# Backwards-compatible admin endpoints retained for existing clients.
@router.get("/admin/overview")
def admin_overview(user=Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    from models import VehicleModel, TripModel
    return {"total_users": db.query(UserAccountModel).count(), "active_users": db.query(UserAccountModel).filter(UserAccountModel.is_active == True).count(), "fleet_size": db.query(VehicleModel).filter(VehicleModel.status != "Retired").count(), "active_trips": db.query(TripModel).filter(TripModel.status == "Active").count(), "system_health": "Operational"}

@router.get("/admin/users")
def admin_users(user=Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    rows = db.query(UserAccountModel).order_by(UserAccountModel.created_at.desc()).all()
    return [{"id": r.id, "name": r.name, "email": r.email, "role": r.role, "is_active": r.is_active, "email_verified": r.email_verified, "created_at": r.created_at.isoformat()} for r in rows]

@router.post("/admin/users", status_code=201)
def admin_create_user(payload: AdminUserCreate, user=Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    if payload.role not in ALLOWED_ROLES: raise HTTPException(400, "Invalid role")
    email = payload.email.lower()
    if db.query(UserAccountModel).filter(UserAccountModel.email == email).first(): raise HTTPException(409, "Email already exists")
    row = UserAccountModel(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role=payload.role, email_verified=True, is_active=True)
    db.add(row); db.flush(); _audit(db, user, "user_created", f"user:{row.id}", f"role={row.role}"); db.commit(); db.refresh(row)
    return {"id": row.id, "name": row.name, "email": row.email, "role": row.role, "is_active": row.is_active}

@router.patch("/admin/users/{user_id}")
def admin_update_user(user_id: int, payload: AdminUserUpdate, user=Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    row = db.get(UserAccountModel, user_id)
    if not row: raise HTTPException(404, "User not found")
    if row.id == user.id and payload.is_active is False: raise HTTPException(400, "You cannot disable your own admin account")
    if payload.email and payload.email.lower() != row.email and db.query(UserAccountModel).filter(UserAccountModel.email == payload.email.lower()).first(): raise HTTPException(409, "Email already exists")
    if payload.name is not None: row.name = payload.name.strip()
    if payload.email is not None: row.email = payload.email.lower()
    if payload.role is not None:
        if payload.role not in ALLOWED_ROLES: raise HTTPException(400, "Invalid role")
        row.role = payload.role
    if payload.is_active is not None: row.is_active = payload.is_active
    db.query(AuthTokenModel).filter(AuthTokenModel.user_id == row.id).update({"used": True}) if not row.is_active else None
    _audit(db, user, "user_updated", f"user:{row.id}", f"role={row.role},active={row.is_active}"); db.commit(); db.refresh(row)
    return {"id": row.id, "name": row.name, "email": row.email, "role": row.role, "is_active": row.is_active}

@router.post("/admin/users/{user_id}/password")
def admin_reset_password(user_id: int, payload: AdminPasswordUpdate, user=Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    row = db.get(UserAccountModel, user_id)
    if not row: raise HTTPException(404, "User not found")
    row.password_hash = hash_password(payload.password); db.query(AuthTokenModel).filter(AuthTokenModel.user_id == row.id).update({"used": True}); _audit(db, user, "password_reset", f"user:{row.id}"); db.commit()
    return {"message": "Password reset and existing sessions revoked"}

@router.get("/admin/audit-logs")
def admin_audit_logs(user=Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    rows = db.query(AuditLogModel).order_by(AuditLogModel.created_at.desc()).limit(200).all()
    return [{"id": r.id, "user_email": r.user_email, "action": r.action, "target": r.target, "details": r.details, "created_at": r.created_at.isoformat()} for r in rows]

# Expanded control plane: /api/auth/control/*
router.include_router(admin_control_router)
