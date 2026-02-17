from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Support importing `main` as a module (tests import `main`) or as a package.
from backend.routes.tasks import router as task_router
from backend.routes.auth import router as auth_router
from backend.db import engine
from backend.models.task import Task

# Import all models to ensure all tables are registered for SQLModel metadata
from backend.src.models.user import User
from backend.models.task import Task
from backend.src.models.conversation import Conversation
from backend.src.models.message import Message
from backend.src.api.chat import router as chat_router


# Create the FastAPI app
app = FastAPI(
    title="Task Management API",
    description="A secure task management backend with JWT authentication",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the task router
app.include_router(task_router)

# Include the auth router (development-only token issuer)
app.include_router(auth_router)

# Include the chat router (AI Todo Chatbot)
app.include_router(chat_router)


from sqlmodel import SQLModel
import logging
from sqlalchemy.exc import OperationalError


@app.on_event("startup")
def on_startup():
    """Initialize the database tables on startup"""
    # Create tables if they don't exist. If the database is unreachable,
    # log a warning and continue so the app can still run for local debugging.
    try:
        SQLModel.metadata.create_all(engine)
    except OperationalError as e:
        logging.getLogger(__name__).warning("Database not available on startup: %s", e)


@app.get("/")
def read_root():
    """Root endpoint for health check"""
    return {"message": "Task Management API is running!"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}