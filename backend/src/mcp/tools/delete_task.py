"""delete_task MCP tool for deleting tasks."""

import logging
from typing import Any, Dict
from sqlmodel import Session, select
from backend.db import engine
from backend.models.task import Task

logger = logging.getLogger(__name__)


async def delete_task(
    user_id: str,
    task_id: int
) -> Dict[str, Any]:
    """
    Delete a task permanently.
    
    IMPORTANT: This tool should only be called after explicit user confirmation.
    The chatbot should always confirm before calling this tool.
    
    Args:
        user_id: Authenticated user ID (enforced by MCP server)
        task_id: ID of the task to delete
        
    Returns:
        Dictionary with success status and message
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
            
            # Delete the task
            session.delete(task)
            session.commit()
            
            logger.info(f"Deleted task {task_id} for user {user_id}")
            
            return {
                "success": True,
                "message": f"Task '{task.title}' deleted successfully"
            }
            
    except Exception as e:
        logger.exception(f"Error deleting task for user {user_id}: {e}")
        return {
            "error": "DatabaseError",
            "message": str(e),
            "success": False
        }
