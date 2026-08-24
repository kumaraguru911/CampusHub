from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.building import Building
from app.schemas.building import BuildingCreate, BuildingResponse

router = APIRouter(
    prefix="/api/buildings",
    tags=["Buildings"],
)


@router.post(
    "",
    response_model=BuildingResponse,
    status_code=201,
)
def create_building(
    building: BuildingCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Building)
        .filter(Building.code == building.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Building code already exists",
        )

    new_building = Building(
        name=building.name,
        code=building.code,
        location=building.location,
    )

    db.add(new_building)
    db.commit()
    db.refresh(new_building)

    return new_building


@router.get(
    "",
    response_model=list[BuildingResponse],
)
def get_buildings(
    db: Session = Depends(get_db),
):
    return db.query(Building).all()


@router.get(
    "/{building_id}",
    response_model=BuildingResponse,
)
def get_building(
    building_id: int,
    db: Session = Depends(get_db),
):
    building = (
        db.query(Building)
        .filter(Building.id == building_id)
        .first()
    )

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found",
        )

    return building


@router.put(
    "/{building_id}",
    response_model=BuildingResponse,
)
def update_building(
    building_id: int,
    building_data: BuildingCreate,
    db: Session = Depends(get_db),
):
    building = (
        db.query(Building)
        .filter(Building.id == building_id)
        .first()
    )

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found",
        )

    building.name = building_data.name
    building.code = building_data.code
    building.location = building_data.location

    db.commit()
    db.refresh(building)

    return building


@router.delete(
    "/{building_id}",
    status_code=204,
)
def delete_building(
    building_id: int,
    db: Session = Depends(get_db),
):
    building = (
        db.query(Building)
        .filter(Building.id == building_id)
        .first()
    )

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found",
        )

    db.delete(building)
    db.commit()
