"""get_current_user MCP tool for identity queries."""

import logging
from typing import Any, Dict
from sqlmodel import Session, select
from backend.db import engine
from backend.src.models.user import User

logger = logging.getLogger(__name__)


async def get_current_user(user_id: str) -> Dict[str, Any]:
    """
    Get the current authenticated user's information.
    
    Args:
        user_id: Authenticated user ID from JWT (enforced by MCP server)
        
    Returns:
        Dictionary with user_id, email, and created_at
    """
    try:
        with Session(engine) as session:
            # Get user from database
            statement = select(User).where(User.id == user_id)
            result = await session.execute(statement) if hasattr(session, 'execute') else session.exec(select(User).where(User.id == user_id))
            
            # For sync session, use exec
            if hasattr(session, 'exec'):
                user = session.exec(select(User).where(User.email == user_id)).first()
                if not user:
                    # Try to find by ID if email lookup fails
                    user = session.exec(select(User).where(User.id == int(user_id) if user_id.isdigit() else user_id)).first()
            else:
                user = result.scalar_one_or_none()
            
            if not user:
                # User might be identified by email (string ID)
                # Return the user_id as email since that's how Better Auth works
                return {
                    "user_id": user_id,
                    "email": user_id,  # In Better Auth, user_id is often the email
                    "created_at": None
                }
            
            return {
                "user_id": str(user.id),
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            
    except Exception as e:
        logger.exception(f"Error getting user info for {user_id}: {e}")
        return {
            "error": "DatabaseError",
            "message": str(e)
        }
