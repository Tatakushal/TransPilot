from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import or_, text
from sqlalchemy.orm import Session

from auth_models import AuditLogModel, AuthTokenModel, UserAccountModel
from auth_security import hash_password
from authorization import current_user
from database import get_db

router = APIRouter(prefix="/control", tags=["Administration"])

ROLE_PERMISSIONS = {
    "admin": ["dashboard", "vehicles", "drivers", "trips", "fuel", "maintenance", "reports", "users", "roles", "audit_logs", "settings"],
    "fleet-manager": ["dashboard", "vehicles", "drivers", "trips", "fuel", "maintenance", "reports"],
    "dispatcher": ["dashboard", "vehicles", "drivers", "trips"],
    "safety-officer": ["dashboard", "drivers", "maintenance", "reports"],
    "financial-analyst": ["dashboard", "fuel", "reports"],
}
ROLE_LABELS = {"admin": "Administrator", "fleet-manager": "Fleet Manager", "dispatcher": "Dispatcher", "safety-officer": "Safety Officer", "financial-analyst": "Financial Analyst"}
ROLES = tuple(ROLE_PERMISSIONS)


def _admin(user):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _audit(db: Session, actor, action: str, target: Optional[str] = None, details: Optional[str] = None):
    db.add(AuditLogModel(user_id=actor.id, user_email=actor.email, action=action, target=target, details=details))


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="fleet-manager", min_length=3, max_length=40)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class PasswordUpdate(BaseModel):
    password: str = Field(..., min_length=8, max_length=128)


@router.get("/overview")
def overview(user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    from models import DriverModel, TripModel, VehicleModel
    active_tokens = db.query(AuthTokenModel).filter(AuthTokenModel.token_type == "access", AuthTokenModel.used == False, AuthTokenModel.expires_at > datetime.utcnow()).count()
    return {"total_users": db.query(UserAccountModel).count(), "active_users": db.query(UserAccountModel).filter(UserAccountModel.is_active == True).count(), "disabled_users": db.query(UserAccountModel).filter(UserAccountModel.is_active == False).count(), "fleet_size": db.query(VehicleModel).filter(VehicleModel.status != "Retired").count(), "active_trips": db.query(TripModel).filter(TripModel.status == "Active").count(), "available_drivers": db.query(DriverModel).filter(DriverModel.status == "Available").count(), "active_sessions": active_tokens, "audit_events": db.query(AuditLogModel).count(), "system_health": "Operational"}


@router.get("/users")
def users(search: str = Query(default="", max_length=100), role: Optional[str] = Query(default=None), status: Optional[str] = Query(default=None), user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    query = db.query(UserAccountModel)
    if search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(or_(UserAccountModel.name.ilike(term), UserAccountModel.email.ilike(term)))
    if role:
        query = query.filter(UserAccountModel.role == role)
    if status == "active":
        query = query.filter(UserAccountModel.is_active == True)
    elif status == "disabled":
        query = query.filter(UserAccountModel.is_active == False)
    rows = query.order_by(UserAccountModel.created_at.desc()).all()
    return [{"id": r.id, "name": r.name, "email": r.email, "role": r.role, "is_active": r.is_active, "email_verified": r.email_verified, "created_at": r.created_at.isoformat()} for r in rows]


@router.post("/users", status_code=201)
def create_user(payload: UserCreate, user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    if payload.role not in ROLES: raise HTTPException(400, "Invalid role")
    email = payload.email.lower()
    if db.query(UserAccountModel).filter(UserAccountModel.email == email).first(): raise HTTPException(409, "An account with this email already exists")
    row = UserAccountModel(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role=payload.role, email_verified=True, is_active=True)
    db.add(row); db.flush(); _audit(db, user, "user_created", f"user:{row.id}", f"role={row.role}"); db.commit(); db.refresh(row)
    return {"id": row.id, "name": row.name, "email": row.email, "role": row.role, "is_active": row.is_active}


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate, user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    row = db.get(UserAccountModel, user_id)
    if not row: raise HTTPException(404, "User not found")
    if row.id == user.id and payload.is_active is False: raise HTTPException(400, "You cannot disable your own admin account")
    if payload.email is not None and payload.email.lower() != row.email:
        if db.query(UserAccountModel).filter(UserAccountModel.email == payload.email.lower()).first(): raise HTTPException(409, "An account with this email already exists")
        row.email = payload.email.lower()
    if payload.name is not None: row.name = payload.name.strip()
    if payload.role is not None:
        if payload.role not in ROLES: raise HTTPException(400, "Invalid role")
        if row.id == user.id and payload.role != "admin": raise HTTPException(400, "You cannot remove your own admin role")
        row.role = payload.role
    if payload.is_active is not None:
        row.is_active = payload.is_active
        if not row.is_active: db.query(AuthTokenModel).filter(AuthTokenModel.user_id == row.id, AuthTokenModel.token_type == "access").update({"used": True})
    _audit(db, user, "user_updated", f"user:{row.id}", f"role={row.role},active={row.is_active}"); db.commit(); db.refresh(row)
    return {"id": row.id, "name": row.name, "email": row.email, "role": row.role, "is_active": row.is_active}


@router.post("/users/{user_id}/password")
def reset_password(user_id: int, payload: PasswordUpdate, user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    row = db.get(UserAccountModel, user_id)
    if not row: raise HTTPException(404, "User not found")
    row.password_hash = hash_password(payload.password)
    db.query(AuthTokenModel).filter(AuthTokenModel.user_id == row.id, AuthTokenModel.token_type == "access").update({"used": True})
    _audit(db, user, "password_reset", f"user:{row.id}", "All existing access sessions revoked"); db.commit()
    return {"message": "Password reset and existing sessions revoked"}


@router.get("/roles")
def roles(user=Depends(current_user)):
    _admin(user)
    return [{"id": key, "name": ROLE_LABELS[key], "permissions": ROLE_PERMISSIONS[key]} for key in ROLES]


@router.get("/audit-logs")
def audit_logs(search: str = Query(default="", max_length=100), action: Optional[str] = Query(default=None), limit: int = Query(default=100, ge=1, le=500), user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    query = db.query(AuditLogModel)
    if search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(or_(AuditLogModel.user_email.ilike(term), AuditLogModel.action.ilike(term), AuditLogModel.target.ilike(term), AuditLogModel.details.ilike(term)))
    if action: query = query.filter(AuditLogModel.action == action)
    rows = query.order_by(AuditLogModel.created_at.desc()).limit(limit).all()
    return [{"id": r.id, "user_email": r.user_email, "action": r.action, "target": r.target, "details": r.details, "created_at": r.created_at.isoformat()} for r in rows]


@router.get("/sessions")
def sessions(user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    rows = db.query(AuthTokenModel, UserAccountModel).join(UserAccountModel, UserAccountModel.id == AuthTokenModel.user_id).filter(AuthTokenModel.token_type == "access", AuthTokenModel.used == False, AuthTokenModel.expires_at > datetime.utcnow()).order_by(AuthTokenModel.expires_at.desc()).all()
    return [{"id": token.id, "user_id": account.id, "user_email": account.email, "user_name": account.name, "expires_at": token.expires_at.isoformat()} for token, account in rows]


@router.delete("/sessions/{token_id}")
def revoke_session(token_id: int, user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    token = db.query(AuthTokenModel).filter(AuthTokenModel.id == token_id, AuthTokenModel.token_type == "access").first()
    if not token: raise HTTPException(404, "Session not found")
    token.used = True; token.used_at = datetime.utcnow(); _audit(db, user, "session_revoked", f"session:{token.id}"); db.commit()
    return {"message": "Session revoked"}


@router.get("/health")
def system_health(user=Depends(current_user), db: Session = Depends(get_db)):
    _admin(user)
    db.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected", "timestamp": datetime.now(timezone.utc).isoformat()}
