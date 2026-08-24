from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    room_id: Mapped[int] = mapped_column(
        ForeignKey("rooms.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    asset_tag: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    asset_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    manufacturer: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    model: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    serial_number: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )

    monitoring_enabled: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    monitoring_target: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    purchase_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    room = relationship(
        "Room",
        back_populates="assets",
    )