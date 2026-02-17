"""update_task MCP tool for updating task details."""

import logging
from datetime import datetime
from typing import Optional, Any, Dict, List
from sqlmodel import Session, select
from backend.db import engine
from backend.models.task import Task

logger = logging.getLogger(__name__)


async def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update an existing task's attributes.
    
    Args:
        user_id: Authenticated user ID (enforced by MCP server)
        task_id: ID of the task to update
        title: New task title (optional)
        priority: New priority: low, medium, or high (optional)
        due_date: New due date in YYYY-MM-DD format (optional)
        
    Returns:
        Dictionary with task_id and list of updated_fields
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
            
            updated_fields: List[str] = []
            
            # Update title if provided
            if title is not None:
                if len(title.strip()) == 0:
                    return {
                        "error": "ValidationError",
                        "message": "Title cannot be empty"
                    }
                if len(title) > 200:
                    return {
                        "error": "ValidationError",
                        "message": "Title must be 200 characters or less"
                    }
                task.title = title
                updated_fields.append("title")
            
            # Update priority if provided
            if priority is not None:
                valid_priorities = ["low", "medium", "high"]
                if priority.lower() not in valid_priorities:
                    return {
                        "error": "ValidationError",
                        "message": f"Priority must be one of: {', '.join(valid_priorities)}"
                    }
                task.priority = priority.lower()
                updated_fields.append("priority")
            
            # Update due_date if provided
            if due_date is not None:
                try:
                    task.due_date = datetime.strptime(due_date, "%Y-%m-%d")
                    updated_fields.append("due_date")
                except ValueError:
                    return {
                        "error": "ValidationError",
                        "message": "due_date must be in YYYY-MM-DD format"
                    }
            
            # Update timestamp
            task.updated_at = datetime.utcnow()
            
            session.add(task)
            session.commit()
            session.refresh(task)
            
            logger.info(f"Updated task {task_id} fields: {updated_fields} for user {user_id}")
            
            return {
                "task_id": task_id,
                "updated_fields": updated_fields
            }
            
    except Exception as e:
        logger.exception(f"Error updating task for user {user_id}: {e}")
        return {
            "error": "DatabaseError",
            "message": str(e)
        }
