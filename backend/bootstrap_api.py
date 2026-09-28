import os

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from auth_models import AuditLogModel, AuthTokenModel, UserAccountModel
from auth_security import hash_password
from database import get_db
from fleet_records import FuelRecordModel, MaintenanceRecordModel
from models import DriverModel, TripModel, VehicleModel

router = APIRouter(prefix="/bootstrap", tags=["Bootstrap"])


class BootstrapAdminRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=10, max_length=128)


class FreshStartRequest(BootstrapAdminRequest):
    confirmation: str = Field(..., min_length=11, max_length=32)


def _check_bootstrap_key(x_bootstrap_key: str | None) -> None:
    configured_key = os.getenv("ADMIN_BOOTSTRAP_KEY", "").strip()
    if not configured_key or not x_bootstrap_key or x_bootstrap_key != configured_key:
        raise HTTPException(403, "Bootstrap access denied")


def _ensure_first_run(db: Session) -> None:
    if db.query(UserAccountModel).filter(UserAccountModel.role == "admin").first():
        raise HTTPException(409, "Workspace is already initialized; no bootstrap reset is allowed")


@router.post("/admin", status_code=201)
def bootstrap_admin(payload: BootstrapAdminRequest, x_bootstrap_key: str | None = Header(default=None), db: Session = Depends(get_db)):
    _check_bootstrap_key(x_bootstrap_key)
    _ensure_first_run(db)
    email = payload.email.lower()
    if db.query(UserAccountModel).filter(UserAccountModel.email == email).first():
        raise HTTPException(409, "An account with this email already exists")
    row = UserAccountModel(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role="admin", email_verified=True, is_active=True)
    db.add(row)
    db.commit()
    return {"message": "Administrator created. Remove or rotate ADMIN_BOOTSTRAP_KEY after first use.", "id": row.id, "email": row.email}


@router.post("/fresh-start", status_code=201)
def fresh_start(payload: FreshStartRequest, x_bootstrap_key: str | None = Header(default=None), db: Session = Depends(get_db)):
    """Destructive first-run reset: clears operational/auth data and creates the first administrator."""
    _check_bootstrap_key(x_bootstrap_key)
    _ensure_first_run(db)
    if payload.confirmation != "START FRESH":
        raise HTTPException(400, 'Type "START FRESH" to confirm this destructive reset.')
    try:
        for model in (
            AuthTokenModel,
            AuditLogModel,
            UserAccountModel,
            FuelRecordModel,
            MaintenanceRecordModel,
            TripModel,
            DriverModel,
            VehicleModel,
        ):
            db.query(model).delete(synchronize_session=False)

        email = payload.email.lower()
        row = UserAccountModel(
            name=payload.name.strip(),
            email=email,
            password_hash=hash_password(payload.password),
            role="admin",
            email_verified=True,
            is_active=True,
        )
        db.add(row)
        db.commit()
        return {
            "message": "Workspace reset successfully. The database is now a fresh start and the administrator was created.",
            "id": row.id,
            "email": row.email,
        }
    except Exception:
        db.rollback()
        raise
