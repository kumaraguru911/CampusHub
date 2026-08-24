from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    building_id: Mapped[int] = mapped_column(
        ForeignKey("buildings.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    room_number: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    room_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    building = relationship(
        "Building",
        back_populates="rooms",
    )

    assets = relationship(
    "Asset",
    back_populates="room",
    cascade="all, delete-orphan",
    )