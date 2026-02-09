from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import os
import html
from collections import defaultdict
import time
import logging
from pydantic import BaseModel

from ..models.conversation import Conversation
from ..models.message import Message
from ..database import get_async_session
from ..utils.auth import verify_jwt_token

# Rate limiting implementation
user_requests = defaultdict(list)  # Store request times per user
RATE_LIMIT = 10  # Max requests per minute
RATE_LIMIT_WINDOW = 60  # Window in seconds

# Request body model
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])

# Initialize logger
logger = logging.getLogger(__name__)

@router.post("/chat")
async def chat(
    user_id: str,
    request_data: ChatRequest,
    db: AsyncSession = Depends(get_async_session),
    token: Dict[str, Any] = Depends(verify_jwt_token)
):
    """
    Chat endpoint that handles user messages and returns assistant responses.
    
    Args:
        user_id: User ID from the URL path
        request_data: ChatRequest with message and optional conversation_id
        db: AsyncSession database connection
        token: JWT token payload
        
    Returns:
        Dict with conversation_id, response, and tool_calls
    """
    try:
        logger.info(f"Chat request from user: {user_id}")
        
        # Verify that user_id in path matches user_id in token
        token_user_id = token.get("user_id") or token.get("sub")
        if token_user_id != user_id:
            logger.warning(f"User ID mismatch: token={token_user_id}, path={user_id}")
            raise HTTPException(status_code=403, detail="User ID mismatch")

        # Rate limiting
        now = datetime.utcnow()
        # Clean old requests outside the window
        user_requests[user_id] = [req_time for req_time in user_requests[user_id] 
                                 if now - req_time < timedelta(seconds=RATE_LIMIT_WINDOW)]
        
        # Check if user has exceeded rate limit
        if len(user_requests[user_id]) >= RATE_LIMIT:
            logger.warning(f"Rate limit exceeded for user: {user_id}")
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        
        # Add current request time
        user_requests[user_id].append(now)

        # Get or create conversation
        conversation_id = request_data.conversation_id
        if conversation_id:
            logger.debug(f"Loading existing conversation: {conversation_id}")
            # Load existing conversation
            conversation = await db.get(Conversation, conversation_id)
            if not conversation or conversation.user_id != user_id:
                logger.warning(f"Conversation not found or access denied: {conversation_id}")
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            logger.debug(f"Creating new conversation for user: {user_id}")
            # Create new conversation
            conversation = Conversation(user_id=user_id)
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)
            conversation_id = conversation.id
            logger.info(f"Created conversation: {conversation_id}")

        # Input sanitization
        raw_message = request_data.message
        sanitized_message = html.escape(raw_message)
        
        # Performance monitoring
        start_time = time.time()
        
        # Save user message
        logger.debug(f"Saving user message for conversation: {conversation_id}")
        user_message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="user",
            content=sanitized_message
        )
        db.add(user_message)
        await db.commit()
        logger.debug(f"User message saved: {user_message.id}")

        # For now, generate a simple response
        # In production, this would call OpenAI or another LLM service
        assistant_response = f"Received your message: {sanitized_message}"
        
        logger.debug(f"Generated response")

        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="assistant",
            content=assistant_response
        )
        db.add(assistant_message)
        await db.commit()
        logger.debug(f"Assistant message saved: {assistant_message.id}")

        # Calculate response time
        response_time = time.time() - start_time
        logger.info(f"Chat response completed in {response_time:.2f}s for user {user_id}")
        
        return {
            "conversation_id": conversation_id,
            "response": assistant_response,
            "tool_calls": [],
            "response_time": round(response_time, 2)
        }
        
    except HTTPException:
        # Re-raise HTTPException as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")