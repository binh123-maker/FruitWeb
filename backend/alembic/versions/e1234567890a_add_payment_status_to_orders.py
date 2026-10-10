"""Add payment_status column to orders table

Revision ID: e1234567890a
Revises: d94812fa5678
Create Date: 2026-10-09 22:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1234567890a'
down_revision: Union[str, Sequence[str], None] = 'd94812fa5678'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add payment_status column with server_default='unpaid' to ensure backward compatibility
    op.add_column(
        'orders',
        sa.Column('payment_status', sa.String(length=50), nullable=False, server_default='unpaid')
    )

    # 2. Update existing rows with accurate status based on historical data
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE orders SET payment_status = 'paid_mock' WHERE payment_method = 'ONLINE_MOCK'")
    )
    conn.execute(
        sa.text("UPDATE orders SET payment_status = 'paid' WHERE status = 'delivered' AND payment_method != 'ONLINE_MOCK'")
    )


def downgrade() -> None:
    op.drop_column('orders', 'payment_status')
