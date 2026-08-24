from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.asset import Asset
from app.models.room import Room
from app.schemas.asset import AssetCreate, AssetResponse

router = APIRouter(
    prefix="/api/assets",
    tags=["Assets"],
)


@router.post(
    "",
    response_model=AssetResponse,
    status_code=201,
)
def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
):
    room = (
        db.query(Room)
        .filter(Room.id == asset_data.room_id)
        .first()
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    existing = (
        db.query(Asset)
        .filter(Asset.asset_tag == asset_data.asset_tag)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Asset tag already exists",
        )

    asset = Asset(
        room_id=asset_data.room_id,
        name=asset_data.name,
        asset_tag=asset_data.asset_tag,
        asset_type=asset_data.asset_type,
        manufacturer=asset_data.manufacturer,
        model=asset_data.model,
        serial_number=asset_data.serial_number,
        status=asset_data.status,
        purchase_date=asset_data.purchase_date,
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset


@router.get(
    "",
    response_model=list[AssetResponse],
)
def get_assets(
    db: Session = Depends(get_db),
):
    return db.query(Asset).all()


@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    return asset