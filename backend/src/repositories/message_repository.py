"""Message repository for AI Chatbot Integration."""

from sqlmodel import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from backend.src.models.message import Message
from backend.src.repositories.conversation_repository import ConversationRepository


class MessageRepository:
    """Repository for Message database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        conversation_id: int,
        role: str,
        content: str
    ) -> Message:
        """Create a new message in a conversation."""
        message = Message(conversation_id=conversation_id, role=role, content=content)
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)

        # Update conversation's updated_at
        await self._update_conversation_timestamp(conversation_id)
        return message

    async def _update_conversation_timestamp(self, conversation_id: int) -> None:
        """Update parent conversation's updated_at timestamp."""
        conv_repo = ConversationRepository(self.session)
        await conv_repo.update_timestamp(conversation_id)

    async def list_by_conversation(
        self,
        conversation_id: int,
        limit: int = 100,
        offset: int = 0
    ) -> List[Message]:
        """Get messages for a conversation, ordered chronologically."""
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_last_message(self, conversation_id: int) -> Optional[Message]:
        """Get the most recent message in a conversation."""
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def count_by_conversation(self, conversation_id: int) -> int:
        """Count messages in a conversation."""
        statement = select(func.count()).select_from(Message).where(
            Message.conversation_id == conversation_id
        )
        result = await self.session.execute(statement)
        return result.scalar() or 0
