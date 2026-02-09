from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from sqlalchemy.exc import OperationalError
import logging
import asyncio

# Import routes from both applications
from routes.tasks import router as task_router
from routes.auth import router as auth_router
from chatbot.routes.chat import router as chat_router
from db import engine
from models.task import Task
from models.user import User
from chatbot.database import create_tables as create_chat_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup"""
    # Create tables for both applications
    try:
        # Create tables for the main application (tasks, users)
        SQLModel.metadata.create_all(engine)
        # Create tables for the chatbot application
        asyncio.run(create_chat_tables())
    except OperationalError as e:
        logging.getLogger(__name__).warning("Database not available on startup: %s", e)
    
    yield
    
    # Cleanup operations can go here if needed


# Create the FastAPI app
app = FastAPI(
    title="Unified Task Management & Chatbot API",
    description="A secure task management and AI chatbot backend with JWT authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers from both applications
app.include_router(task_router)
app.include_router(auth_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    """Root endpoint for health check"""
    return {"message": "Unified Task Management & Chatbot API is running!"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}