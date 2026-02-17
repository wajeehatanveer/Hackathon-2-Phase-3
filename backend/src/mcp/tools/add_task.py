"""add_task MCP tool for creating tasks via chat."""

import logging
from datetime import datetime
from typing import Optional, Any, Dict
from sqlmodel import Session
from backend.db import engine
from backend.models.task import Task

logger = logging.getLogger(__name__)


async def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new task for the authenticated user.
    
    Args:
        user_id: Authenticated user ID (enforced by MCP server)
        title: Task title (required)
        description: Optional task description
        priority: Task priority (low, medium, high)
        due_date: Optional due date in YYYY-MM-DD format
        
    Returns:
        Dictionary with task_id, title, and status
    """
    try:
        # Validate priority
        valid_priorities = ["low", "medium", "high"]
        if priority not in valid_priorities:
            priority = "medium"
        
        # Parse due_date if provided
        due_date_dt = None
        if due_date:
            try:
                due_date_dt = datetime.strptime(due_date, "%Y-%m-%d")
            except ValueError:
                logger.warning(f"Invalid due_date format: {due_date}")
                due_date_dt = None
        
        with Session(engine) as session:
            # Create the task
            task = Task(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
                due_date=due_date_dt,
                completed=False
            )
            
            session.add(task)
            session.commit()
            session.refresh(task)
            
            logger.info(f"Created task {task.id} for user {user_id}: {title}")
            
            return {
                "task_id": task.id,
                "title": task.title,
                "status": "created"
            }
            
    except Exception as e:
        logger.exception(f"Error creating task for user {user_id}: {e}")
        return {
            "error": "DatabaseError",
            "message": str(e)
        }
