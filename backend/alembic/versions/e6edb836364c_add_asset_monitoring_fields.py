"""add asset monitoring fields

Revision ID: e6edb836364c
Revises: 
Create Date: 2026-08-23 22:41:45.391072

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6edb836364c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "assets",
        sa.Column(
            "monitoring_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    op.add_column(
        "assets",
        sa.Column(
            "monitoring_target",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.alter_column(
        "assets",
        "monitoring_enabled",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("assets", "monitoring_target")
    op.drop_column("assets", "monitoring_enabled")
