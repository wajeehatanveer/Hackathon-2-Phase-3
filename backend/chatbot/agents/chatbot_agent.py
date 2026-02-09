from openai import OpenAI
import os

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Create or retrieve assistant
assistant = client.beta.assistants.create(
    name="Todo Chatbot Assistant",
    instructions="You are a helpful assistant that helps users manage their tasks. Use the provided tools to add, list, update, complete, and delete tasks. Always respond in a friendly and helpful manner.",
    model="gpt-4o-mini",  # use a supported model
    tools=[
        # Define tools that connect to your MCP server
        {
            "type": "function",
            "function": {
                "name": "add_task",
                "description": "Add a new task for a user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "priority": {"type": "string"},
                        "due_date": {"type": "string"},
                        "tags": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["user_id", "title"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "list_tasks",
                "description": "List tasks for a user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "status": {"type": "string"},
                        "priority": {"type": "string"}
                    },
                    "required": ["user_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update an existing task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "task_id": {"type": "integer"},
                        "updates": {"type": "object"}
                    },
                    "required": ["user_id", "task_id", "updates"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "complete_task",
                "description": "Mark a task as complete",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "task_id": {"type": "integer"}
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Delete a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "task_id": {"type": "integer"}
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        }
    ]
)