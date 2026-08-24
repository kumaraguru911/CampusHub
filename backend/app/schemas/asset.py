from datetime import date

from pydantic import BaseModel, ConfigDict


class AssetCreate(BaseModel):
    room_id: int
    name: str
    asset_tag: str
    asset_type: str
    manufacturer: str | None = None
    model: str | None = None
    serial_number: str | None = None
    status: str = "ACTIVE"
    purchase_date: date | None = None
    monitoring_enabled: bool = False
    monitoring_target: str | None = None


class AssetResponse(AssetCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)