"""Cohere AI service for natural language processing."""

import cohere
import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from backend.src.core.config import settings

logger = logging.getLogger(__name__)


class CohereService:
    """Service for interacting with Cohere AI API."""

    def __init__(self):
        """Initialize Cohere client with API key from settings."""
        self.client = cohere.Client(settings.cohere_api_key)
        self.model = "command-r-08-2024"  # Use available Cohere model with tool calling
        
        # Define available tools for the AI
        self.tools = [
            {
                "name": "add_task",
                "description": "Create a new task for the authenticated user. Use when user wants to add a todo or reminder.",
                "parameter_definitions": {
                    "title": {
                        "type": "string",
                        "description": "Task title (required)",
                        "required": True
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description",
                        "required": False
                    },
                    "priority": {
                        "type": "string",
                        "description": "Task priority: low, medium, or high",
                        "required": False
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Due date in YYYY-MM-DD format",
                        "required": False
                    }
                }
            },
            {
                "name": "list_tasks",
                "description": "List tasks with optional filtering. Use when user wants to see their tasks.",
                "parameter_definitions": {
                    "status": {
                        "type": "string",
                        "description": "Filter by status: pending or completed",
                        "required": False
                    },
                    "priority": {
                        "type": "string",
                        "description": "Filter by priority: low, medium, or high",
                        "required": False
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of tasks to return (default 50)",
                        "required": False
                    }
                }
            },
            {
                "name": "mark_complete",
                "description": "Mark a task as completed or reopen it. Use when user wants to complete or reopen a task.",
                "parameter_definitions": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to update",
                        "required": True
                    },
                    "completed": {
                        "type": "boolean",
                        "description": "True to mark complete, false to reopen",
                        "required": True
                    }
                }
            },
            {
                "name": "update_task",
                "description": "Update an existing task's attributes. Use when user wants to modify title, description, priority, or due date.",
                "parameter_definitions": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to update",
                        "required": True
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title",
                        "required": False
                    },
                    "priority": {
                        "type": "string",
                        "description": "New priority: low, medium, or high",
                        "required": False
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in YYYY-MM-DD format",
                        "required": False
                    }
                }
            },
            {
                "name": "delete_task",
                "description": "Delete a task permanently. ALWAYS confirm with user before calling this tool.",
                "parameter_definitions": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to delete",
                        "required": True
                    }
                }
            },
            {
                "name": "get_current_user",
                "description": "Get the current authenticated user's information. Use when user asks 'Who am I?' or about their email.",
                "parameter_definitions": {}
            }
        ]

    async def chat(
        self,
        message: str,
        user_id: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to Cohere and get a response with potential tool calls.
        
        Args:
            message: User's natural language message
            user_id: Authenticated user's ID for context
            conversation_history: Optional list of previous messages
            
        Returns:
            Dictionary containing:
            - response: Natural language response from assistant
            - tool_calls: List of tool calls to execute (if any)
        """
        try:
            # Build chat history
            chat_history = conversation_history or []
            
            # Add system context
            system_message = f"""You are an intelligent AI assistant helping users manage their todo tasks.
Current user ID: {user_id}
Current date: {datetime.now().strftime('%Y-%m-%d')}

You have access to the following tools:
- add_task: Create new tasks
- list_tasks: List/filter tasks
- mark_complete: Complete or reopen tasks
- update_task: Update task details
- delete_task: Delete tasks (always confirm first!)
- get_current_user: Get user info

When you need to use a tool, respond with a tool call. Otherwise, respond naturally.
Be helpful, concise, and friendly. Use markdown formatting for lists and emphasis.
"""
            
            # Add user message
            chat_history.append({"role": "USER", "message": message})
            
            # Call Cohere API
            response = self.client.chat(
                message=message,
                model=self.model,
                chat_history=chat_history[:-1],  # Exclude last message (already in history)
                preamble=system_message,
                tools=self.tools,
                temperature=0.7,
            )
            
            # Extract tool calls if any
            tool_calls = []
            if response.tool_calls:
                for tool_call in response.tool_calls:
                    tool_calls.append({
                        "name": tool_call.name,
                        "parameters": tool_call.parameters if hasattr(tool_call, 'parameters') else {}
                    })
            
            return {
                "response": response.text,
                "tool_calls": tool_calls,
                "conversation_id": getattr(response, 'conversation_id', None)
            }
            
        except Exception as e:
            # Handle all Cohere errors as generic exceptions
            if "Cohere" in str(type(e).__module__):
                logger.error(f"Cohere API error: {e}")
            else:
                logger.error(f"Unexpected error in Cohere chat: {e}")
            raise

    def parse_date_from_natural_language(self, text: str) -> Optional[str]:
        """
        Parse natural language date references into YYYY-MM-DD format.
        
        Examples:
            "tomorrow" -> 2026-02-18
            "next Friday" -> 2026-02-21
            "next week" -> 2026-02-24
        """
        from datetime import timedelta
        
        today = datetime.now()
        text_lower = text.lower()
        
        # Handle "tomorrow"
        if "tomorrow" in text_lower:
            return (today + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Handle "today"
        if "today" in text_lower:
            return today.strftime("%Y-%m-%d")
        
        # Handle "next week"
        if "next week" in text_lower:
            return (today + timedelta(weeks=1)).strftime("%Y-%m-%d")
        
        # Handle days of the week
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for i, day in enumerate(days):
            if day in text_lower:
                # Find next occurrence of this day
                current_day = today.weekday()
                days_ahead = i - current_day
                if days_ahead <= 0:  # Target day already happened this week
                    days_ahead += 7
                if "next" in text_lower:
                    days_ahead += 7
                return (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        
        return None
