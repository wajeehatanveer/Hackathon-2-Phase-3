"""mark_complete MCP tool for completing or reopening tasks."""

import logging
from datetime import datetime
from typing import Any, Dict
from sqlmodel import Session, select
from backend.db import engine
from backend.models.task import Task

logger = logging.getLogger(__name__)


async def mark_complete(
    user_id: str,
    task_id: int,
    completed: bool
) -> Dict[str, Any]:
    """
    Mark a task as completed or reopen it.
    
    Args:
        user_id: Authenticated user ID (enforced by MCP server)
        task_id: ID of the task to update
        completed: True to mark complete, false to reopen
        
    Returns:
        Dictionary with task_id, completed status, and completed_at timestamp
    """
    try:
        with Session(engine) as session:
            # Get the task
            task = session.get(Task, task_id)
            
            if not task:
                return {
                    "error": "NotFoundError",
                    "message": f"Task {task_id} not found"
                }
            
            # Verify user ownership
            if task.user_id != user_id:
                return {
                    "error": "AuthenticationError",
                    "message": "Task does not belong to this user"
                }
            
            # Update completion status
            task.completed = completed
            
            # Set completed_at timestamp if completing, clear if reopening
            if completed:
                task.completed_at = datetime.utcnow()
            else:
                task.completed_at = None
                
            task.updated_at = datetime.utcnow()
            
            session.add(task)
            session.commit()
            session.refresh(task)
            
            logger.info(f"Task {task_id} marked as {'complete' if completed else 'reopened'} for user {user_id}")
            
            return {
                "task_id": task_id,
                "completed": completed,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None
            }
            
    except Exception as e:
        logger.exception(f"Error marking task complete for user {user_id}: {e}")
        return {
            "error": "DatabaseError",
            "message": str(e)
        }
