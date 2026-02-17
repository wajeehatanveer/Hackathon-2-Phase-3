"""list_tasks MCP tool for listing and filtering tasks."""

import logging
from typing import Optional, Any, Dict, List
from sqlmodel import Session, select
from backend.db import engine
from backend.models.task import Task

logger = logging.getLogger(__name__)


async def list_tasks(
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    List tasks with optional filtering.
    
    Args:
        user_id: Authenticated user ID (enforced by MCP server)
        status: Filter by status: pending or completed
        priority: Filter by priority: low, medium, or high
        limit: Maximum number of tasks to return (default 50)
        
    Returns:
        Dictionary with tasks array and count
    """
    try:
        with Session(engine) as session:
            # Build query
            query = select(Task).where(Task.user_id == user_id)
            
            # Apply status filter
            if status:
                if status.lower() == "pending":
                    query = query.where(Task.completed == False)
                elif status.lower() == "completed":
                    query = query.where(Task.completed == True)
            
            # Apply priority filter
            if priority:
                query = query.where(Task.priority == priority.lower())
            
            # Apply limit and order by created_at desc
            query = query.order_by(Task.created_at.desc()).limit(limit)
            
            tasks = session.exec(query).all()
            
            # Convert to response format
            task_list = []
            for task in tasks:
                task_dict = {
                    "task_id": task.id,
                    "title": task.title,
                    "status": "completed" if task.completed else "pending",
                    "priority": task.priority,
                    "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
                    "completed_at": task.completed_at.isoformat() if hasattr(task, 'completed_at') and task.completed_at else None
                }
                task_list.append(task_dict)
            
            logger.info(f"Listed {len(task_list)} tasks for user {user_id}")
            
            return {
                "tasks": task_list,
                "count": len(task_list)
            }
            
    except Exception as e:
        logger.exception(f"Error listing tasks for user {user_id}: {e}")
        return {
            "error": "DatabaseError",
            "message": str(e),
            "tasks": [],
            "count": 0
        }
