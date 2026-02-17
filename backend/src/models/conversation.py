"""Conversation model for AI Chatbot Integration."""


from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional
if TYPE_CHECKING:
    from .message import Message


class Conversation(SQLModel, table=True):
    """Represents a persistent chat session belonging to a user."""

    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.email", index=True, nullable=False)
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    if TYPE_CHECKING:
        messages: list["Message"]
    messages: list["Message"] = Relationship(back_populates="conversation")
