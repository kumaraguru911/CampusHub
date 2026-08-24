from pydantic import BaseModel, ConfigDict


class RoomCreate(BaseModel):
    building_id: int
    name: str
    room_number: str
    room_type: str
    capacity: int


class RoomResponse(RoomCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)