"""Add images column to products table

Revision ID: f1234567890b
Revises: e1234567890a
Create Date: 2026-10-24 16:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1234567890b'
down_revision: Union[str, Sequence[str], None] = 'e1234567890a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add images column with nullable=True
    op.add_column(
        'products',
        sa.Column('images', sa.JSON(), nullable=True)
    )

    # 2. Populate initial images array with existing image for all products
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE products SET images = json_build_array(image) WHERE image IS NOT NULL AND images IS NULL")
    )


def downgrade() -> None:
    op.drop_column('products', 'images')
