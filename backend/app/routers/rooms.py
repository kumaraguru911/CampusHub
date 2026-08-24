from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.building import Building
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse

router = APIRouter(
    prefix="/api/rooms",
    tags=["Rooms"],
)


@router.post(
    "",
    response_model=RoomResponse,
    status_code=201,
)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
):
    building = (
        db.query(Building)
        .filter(Building.id == room_data.building_id)
        .first()
    )

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found",
        )

    room = Room(
        building_id=room_data.building_id,
        name=room_data.name,
        room_number=room_data.room_number,
        room_type=room_data.room_type,
        capacity=room_data.capacity,
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return room


@router.get(
    "",
    response_model=list[RoomResponse],
)
def get_rooms(
    db: Session = Depends(get_db),
):
    return db.query(Room).all()


@router.get(
    "/{room_id}",
    response_model=RoomResponse,
)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
):
    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    return room


@router.put(
    "/{room_id}",
    response_model=RoomResponse,
)
def update_room(
    room_id: int,
    room_data: RoomCreate,
    db: Session = Depends(get_db),
):
    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    building = (
        db.query(Building)
        .filter(Building.id == room_data.building_id)
        .first()
    )

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found",
        )

    room.building_id = room_data.building_id
    room.name = room_data.name
    room.room_number = room_data.room_number
    room.room_type = room_data.room_type
    room.capacity = room_data.capacity

    db.commit()
    db.refresh(room)

    return room


@router.delete(
    "/{room_id}",
    status_code=204,
)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
):
    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    db.delete(room)
    db.commit()