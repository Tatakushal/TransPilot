from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import VehicleModel
from fleet_records import FuelRecordModel
from authorization import require_permission

router = APIRouter(prefix="/api/fuel", tags=["Fuel"])


class FuelRecord(BaseModel):
    vehicle_registration: str = Field(..., min_length=1, max_length=30)
    fuel_date: date
    liters: float = Field(..., gt=0)
    cost: float = Field(..., ge=0)
    odometer: float = Field(..., ge=0)
    station: str = Field(..., min_length=1, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=500)


class FuelRecordOut(FuelRecord):
    id: int

    class Config:
        from_attributes = True


@router.get("", response_model=list[FuelRecordOut])
def list_fuel(_: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    return db.query(FuelRecordModel).order_by(FuelRecordModel.fuel_date.desc(), FuelRecordModel.id.desc()).all()


@router.get("/{record_id}", response_model=FuelRecordOut)
def get_fuel(record_id: int, _: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    record = db.get(FuelRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Fuel record not found")
    return record


@router.post("", response_model=FuelRecordOut, status_code=201)
def create_fuel(payload: FuelRecord, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    registration = payload.vehicle_registration.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")
    if payload.odometer < vehicle.odometer:
        raise HTTPException(400, "Fuel odometer cannot be lower than the vehicle odometer")

    record = FuelRecordModel(**payload.model_dump(), vehicle_registration=registration)
    vehicle.odometer = payload.odometer
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}", response_model=FuelRecordOut)
def update_fuel(record_id: int, payload: FuelRecord, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    record = db.get(FuelRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Fuel record not found")
    registration = payload.vehicle_registration.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")
    if payload.odometer < vehicle.odometer and registration != record.vehicle_registration:
        raise HTTPException(400, "Fuel odometer cannot be lower than the vehicle odometer")

    for key, value in payload.model_dump().items():
        setattr(record, key, value)
    record.vehicle_registration = registration
    if payload.odometer > vehicle.odometer:
        vehicle.odometer = payload.odometer
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}")
def delete_fuel(record_id: int, _: object = Depends(require_permission("delete")), db: Session = Depends(get_db)):
    record = db.get(FuelRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Fuel record not found")
    db.delete(record)
    db.commit()
    return {"message": "Fuel record deleted"}
