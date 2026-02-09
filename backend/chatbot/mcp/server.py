import asyncio
from mcp.server import Server
from mcp.types import Tool, ArgumentsSchema

# Initialize MCP server
server = Server("todo-chatbot-mcp")

# Import the tools
from ..mcp.tools.add_task import add_task, AddTaskArgs
from ..mcp.tools.list_tasks import list_tasks, ListTasksArgs
from ..mcp.tools.update_task import update_task, UpdateTaskArgs
from ..mcp.tools.complete_task import complete_task, CompleteTaskArgs
from ..mcp.tools.delete_task import delete_task, DeleteTaskArgs

# Register tools with the server
@server.tool(
    "add_task",
    "Add a new task for a user",
    AddTaskArgs.schema()
)
async def handle_add_task(args: AddTaskArgs) -> dict:
    return await add_task(args)

@server.tool(
    "list_tasks", 
    "List tasks for a user",
    ListTasksArgs.schema()
)
async def handle_list_tasks(args: ListTasksArgs) -> dict:
    return await list_tasks(args)

@server.tool(
    "update_task",
    "Update an existing task",
    UpdateTaskArgs.schema()
)
async def handle_update_task(args: UpdateTaskArgs) -> dict:
    return await update_task(args)

@server.tool(
    "complete_task",
    "Mark a task as complete",
    CompleteTaskArgs.schema()
)
async def handle_complete_task(args: CompleteTaskArgs) -> dict:
    return await complete_task(args)

@server.tool(
    "delete_task",
    "Delete a task",
    DeleteTaskArgs.schema()
)
async def handle_delete_task(args: DeleteTaskArgs) -> dict:
    return await delete_task(args)

if __name__ == "__main__":
    # Start the server
    server.run()