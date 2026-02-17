"""Conversation repository for AI Chatbot Integration."""

from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional, List

from backend.src.models.conversation import Conversation


class ConversationRepository:
    """Repository for Conversation database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_id: str, title: Optional[str] = None) -> Conversation:
        """Create a new conversation for a user."""
        conversation = Conversation(user_id=user_id, title=title)
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def get_by_id(self, conversation_id: int, user_id: str) -> Optional[Conversation]:
        """Get conversation by ID, scoped to user."""
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Conversation]:
        """List user's conversations, ordered by recency."""
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def update_title(self, conversation_id: int, title: str) -> Optional[Conversation]:
        """Update conversation title."""
        statement = select(Conversation).where(Conversation.id == conversation_id)
        result = await self.session.execute(statement)
        conversation = result.scalar_one_or_none()

        if conversation:
            conversation.title = title
            conversation.updated_at = datetime.utcnow()
            await self.session.commit()
            await self.session.refresh(conversation)
        return conversation

    async def update_timestamp(self, conversation_id: int) -> Optional[Conversation]:
        """Update conversation's updated_at timestamp."""
        statement = select(Conversation).where(Conversation.id == conversation_id)
        result = await self.session.execute(statement)
        conversation = result.scalar_one_or_none()

        if conversation:
            conversation.updated_at = datetime.utcnow()
            await self.session.commit()
            await self.session.refresh(conversation)
        return conversation

    async def delete(self, conversation_id: int, user_id: str) -> bool:
        """Delete conversation and cascade delete messages."""
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        result = await self.session.execute(statement)
        conversation = result.scalar_one_or_none()

        if conversation:
            await self.session.delete(conversation)
            await self.session.commit()
            return True
        return False
