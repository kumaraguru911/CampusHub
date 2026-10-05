"""create initial schema

Revision ID: 000000000001
Revises:
Create Date: 2026-10-03
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "000000000001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the initial CampusHub schema."""

    op.create_table(
        "buildings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    op.create_index(
        "ix_buildings_id",
        "buildings",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_buildings_code",
        "buildings",
        ["code"],
        unique=True,
    )

    op.create_table(
        "rooms",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("building_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("room_number", sa.String(length=20), nullable=False),
        sa.Column("room_type", sa.String(length=50), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["building_id"],
            ["buildings.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_rooms_id",
        "rooms",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_rooms_building_id",
        "rooms",
        ["building_id"],
        unique=False,
    )

    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("asset_tag", sa.String(length=50), nullable=False),
        sa.Column("asset_type", sa.String(length=50), nullable=False),
        sa.Column("manufacturer", sa.String(length=100), nullable=True),
        sa.Column("model", sa.String(length=100), nullable=True),
        sa.Column("serial_number", sa.String(length=100), nullable=True),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="ACTIVE",
        ),
        sa.Column(
            "monitoring_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "monitoring_target",
            sa.String(length=255),
            nullable=True,
        ),
        sa.Column("purchase_date", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(
            ["room_id"],
            ["rooms.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_tag"),
        sa.UniqueConstraint("serial_number"),
    )

    op.create_index(
        "ix_assets_id",
        "assets",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_assets_room_id",
        "assets",
        ["room_id"],
        unique=False,
    )

    op.create_index(
        "ix_assets_asset_tag",
        "assets",
        ["asset_tag"],
        unique=True,
    )

    op.create_index(
        "ix_assets_asset_type",
        "assets",
        ["asset_type"],
        unique=False,
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("metric", sa.String(length=50), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("threshold", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="ACTIVE",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_alerts_id",
        "alerts",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_alerts_asset_id",
        "alerts",
        ["asset_id"],
        unique=False,
    )

    op.create_index(
        "ix_alerts_metric",
        "alerts",
        ["metric"],
        unique=False,
    )

    op.create_index(
        "ix_alerts_severity",
        "alerts",
        ["severity"],
        unique=False,
    )

    op.create_index(
        "ix_alerts_status",
        "alerts",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    """Drop the initial CampusHub schema."""

    op.drop_index("ix_alerts_status", table_name="alerts")
    op.drop_index("ix_alerts_severity", table_name="alerts")
    op.drop_index("ix_alerts_metric", table_name="alerts")
    op.drop_index("ix_alerts_asset_id", table_name="alerts")
    op.drop_index("ix_alerts_id", table_name="alerts")
    op.drop_table("alerts")

    op.drop_index("ix_assets_asset_type", table_name="assets")
    op.drop_index("ix_assets_asset_tag", table_name="assets")
    op.drop_index("ix_assets_room_id", table_name="assets")
    op.drop_index("ix_assets_id", table_name="assets")
    op.drop_table("assets")

    op.drop_index("ix_rooms_building_id", table_name="rooms")
    op.drop_index("ix_rooms_id", table_name="rooms")
    op.drop_table("rooms")

    op.drop_index("ix_buildings_code", table_name="buildings")
    op.drop_index("ix_buildings_id", table_name="buildings")
    op.drop_table("buildings")
