"""Chat API endpoint for AI Todo Chatbot."""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Session

from backend.db import engine
from backend.auth.dependencies import get_current_user
from backend.src.models.conversation import Conversation
from backend.src.models.message import Message
from backend.src.services.cohere_service import CohereService
from backend.src.mcp.server import MCPServer
from backend.src.mcp.tools import (
    add_task,
    list_tasks,
    mark_complete,
    update_task,
    delete_task,
    get_current_user as get_current_user_tool,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    conversation_id: int
    message: str
    tool_calls: Optional[List[Dict[str, Any]]] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Chat with AI Todo Assistant.
    
    Send a natural language message to the chatbot. The AI will:
    1. Parse the message to identify intent
    2. Execute appropriate MCP tools (add_task, list_tasks, etc.)
    3. Return a natural language response
    
    Supports multi-turn conversations with context retention when
    conversation_id is provided.
    """
    # Verify user ID matches
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )
    
    try:
        # Get or create conversation
        conversation_id = request.conversation_id
        
        with Session(engine) as session:
            if conversation_id:
                # Get existing conversation
                conversation = session.get(Conversation, conversation_id)
                if not conversation or conversation.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Conversation not found"
                    )
            else:
                # Create new conversation with title from first message
                conversation = Conversation(
                    user_id=user_id,
                    title=request.message[:50] + "..." if len(request.message) > 50 else request.message
                )
                session.add(conversation)
                session.commit()
                session.refresh(conversation)
                conversation_id = conversation.id
            
            # Save user message
            user_message = Message(
                conversation_id=conversation_id,
                role="user",
                content=request.message
            )
            session.add(user_message)
            session.commit()
            
            # Get conversation history for context (last 20 messages)
            messages = session.exec(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at.desc())
                .limit(20)
            ).all()
            
            # Convert to chat history format for Cohere
            chat_history = []
            for msg in reversed(messages[:-1]):  # Exclude the message we just added
                chat_history.append({
                    "role": "User" if msg.role == "user" else "Chatbot",
                    "message": msg.content
                })
        
        # Initialize Cohere service and get AI response
        cohere_service = CohereService()
        
        # Get AI response with potential tool calls
        ai_response = await cohere_service.chat(
            message=request.message,
            user_id=user_id,
            conversation_history=chat_history
        )
        
        # Initialize MCP server and execute any tool calls
        tool_results = []
        final_response = ai_response["response"]
        
        with Session(engine) as session:
            mcp_server = MCPServer(session, user_id)
            
            # Register all tools
            mcp_server.register_tool("add_task", add_task)
            mcp_server.register_tool("list_tasks", list_tasks)
            mcp_server.register_tool("mark_complete", mark_complete)
            mcp_server.register_tool("update_task", update_task)
            mcp_server.register_tool("delete_task", delete_task)
            mcp_server.register_tool("get_current_user", get_current_user_tool)
            
            # Execute tool calls if any
            if ai_response.get("tool_calls"):
                for tool_call in ai_response["tool_calls"]:
                    tool_name = tool_call.get("name")
                    parameters = tool_call.get("parameters", {})
                    
                    # Execute the tool
                    result = await mcp_server.execute_tool(tool_name, parameters)
                    tool_results.append({
                        "tool": tool_name,
                        "result": result
                    })
                    
                    # Generate natural language response based on tool result
                    if tool_name == "add_task":
                        if "error" not in result:
                            final_response = f"I've added '{result.get('title', 'the task')}' to your tasks!"
                        else:
                            final_response = f"Sorry, I couldn't add the task: {result.get('message', 'Unknown error')}"
                    
                    elif tool_name == "list_tasks":
                        if "error" not in result:
                            tasks = result.get("tasks", [])
                            count = result.get("count", 0)
                            if count == 0:
                                final_response = "You're all caught up! No tasks yet. Would you like to add one?"
                            else:
                                task_list = "\n".join([
                                    f"{i+1}. **{t['title']}** - {t['status']} (Priority: {t['priority']})"
                                    for i, t in enumerate(tasks[:10])  # Show first 10
                                ])
                                final_response = f"You have {count} task(s):\n\n{task_list}"
                        else:
                            final_response = f"Sorry, I couldn't retrieve your tasks: {result.get('message', 'Unknown error')}"
                    
                    elif tool_name == "mark_complete":
                        if "error" not in result:
                            status_text = "completed" if result.get("completed") else "reopened"
                            final_response = f"Task marked as {status_text}!"
                        else:
                            final_response = f"Sorry, I couldn't update the task: {result.get('message', 'Unknown error')}"
                    
                    elif tool_name == "update_task":
                        if "error" not in result:
                            fields = result.get("updated_fields", [])
                            final_response = f"Task updated: {', '.join(fields)}"
                        else:
                            final_response = f"Sorry, I couldn't update the task: {result.get('message', 'Unknown error')}"
                    
                    elif tool_name == "delete_task":
                        if "error" not in result and result.get("success"):
                            final_response = "Task deleted successfully!"
                        else:
                            final_response = f"Sorry, I couldn't delete the task: {result.get('message', 'Unknown error')}"
                    
                    elif tool_name == "get_current_user":
                        if "error" not in result:
                            email = result.get("email", "unknown")
                            final_response = f"You are logged in as {email}"
                        else:
                            final_response = f"Sorry, I couldn't get your info: {result.get('message', 'Unknown error')}"
        
        # Save assistant response
        with Session(engine) as session:
            assistant_message = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=final_response
            )
            session.add(assistant_message)
            session.commit()
        
        return ChatResponse(
            conversation_id=conversation_id,
            message=final_response,
            tool_calls=tool_results if tool_results else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}"
        )


# Import select for the query above
from sqlmodel import select
