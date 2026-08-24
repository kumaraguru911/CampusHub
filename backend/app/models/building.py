from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    rooms = relationship(
        "Room",
        back_populates="building",
        cascade="all, delete-orphan",
    )