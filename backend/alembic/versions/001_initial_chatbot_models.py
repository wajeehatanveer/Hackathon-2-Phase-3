"""Initial migration for chatbot models

Revision ID: 001_initial_chatbot_models
Revises: 
Create Date: 2026-02-09 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from datetime import datetime

# revision identifiers
revision = '001_initial_chatbot_models'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create conversation table
    op.create_table('conversation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for user_id in conversation table
    op.create_index(op.f('ix_conversation_user_id'), 'conversation', ['user_id'], unique=False)

    # Create message table
    op.create_table('message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for message table
    op.create_index(op.f('ix_message_conversation_id'), 'message', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_message_user_id'), 'message', ['user_id'], unique=False)
    op.create_index(op.f('ix_message_role'), 'message', ['role'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_message_role'), table_name='message')
    op.drop_index(op.f('ix_message_user_id'), table_name='message')
    op.drop_index(op.f('ix_message_conversation_id'), table_name='message')
    op.drop_index(op.f('ix_conversation_user_id'), table_name='conversation')
    
    # Drop tables
    op.drop_table('message')
    op.drop_table('conversation')