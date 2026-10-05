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
down_revision: Union[str, Sequence[str], None] = "000000000001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    
	pass


def downgrade() -> None:
   
	pass
    