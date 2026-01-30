"""Add intensity_preference and budget_range to scent_profiles

Revision ID: f1a2b3c4d5e6
Revises: e8c67008e5c0
Create Date: 2026-01-30 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'e8c67008e5c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('scent_profiles', sa.Column('intensity_preference', sa.String(50), nullable=True))
    op.add_column('scent_profiles', sa.Column('budget_range', sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column('scent_profiles', 'budget_range')
    op.drop_column('scent_profiles', 'intensity_preference')
