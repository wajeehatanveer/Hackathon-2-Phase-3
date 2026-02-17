"""Message model for AI Chatbot Integration."""


from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional
if TYPE_CHECKING:
    from .conversation import Conversation


class Message(SQLModel, table=True):
    """Represents an individual exchange within a conversation."""

    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True, nullable=False)
    role: str = Field(..., max_length=20, nullable=False)  # "user" | "assistant" | "system"
    content: str = Field(..., max_length=10000, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    if TYPE_CHECKING:
        conversation: Optional["Conversation"]
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
