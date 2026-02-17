"""MCP Server for AI Todo Chatbot.

This module provides the MCP (Model Context Protocol) server that exposes
tools to the Cohere AI reasoning layer.
"""

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class MCPServer:
    """MCP Server that manages tool registration and execution."""

    def __init__(self, session: AsyncSession, user_id: str):
        """Initialize MCP server with database session and user context.
        
        Args:
            session: Async database session
            user_id: Authenticated user ID for tool execution
        """
        self.session = session
        self.user_id = user_id
        self.tools: Dict[str, callable] = {}

    def register_tool(self, name: str, func: callable):
        """Register a tool with the server.
        
        Args:
            name: Tool name (must match Cohere tool definition)
            func: Async function that executes the tool
        """
        self.tools[name] = func
        logger.debug(f"Registered tool: {name}")

    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a registered tool.
        
        Args:
            tool_name: Name of the tool to execute
            parameters: Tool parameters from Cohere
            
        Returns:
            Tool execution result
        """
        if tool_name not in self.tools:
            error_msg = f"Unknown tool: {tool_name}"
            logger.error(error_msg)
            return {"error": error_msg}

        try:
            # Add user_id to parameters for all tools (enforces user isolation)
            params_with_user = {**parameters, "user_id": self.user_id}
            
            # Execute the tool
            result = await self.tools[tool_name](**params_with_user)
            logger.info(f"Executed tool {tool_name} for user {self.user_id}")
            return result
            
        except Exception as e:
            logger.exception(f"Error executing tool {tool_name}: {e}")
            return {"error": str(e)}

    def get_available_tools(self) -> List[str]:
        """Get list of registered tool names."""
        return list(self.tools.keys())


# Global MCP server instance (will be initialized per request)
_mcp_server: Optional[MCPServer] = None


def get_mcp_server(session: AsyncSession, user_id: str) -> MCPServer:
    """Get or create MCP server instance for the current request.
    
    Args:
        session: Async database session
        user_id: Authenticated user ID
        
    Returns:
        Configured MCP server instance
    """
    global _mcp_server
    _mcp_server = MCPServer(session, user_id)
    return _mcp_server
