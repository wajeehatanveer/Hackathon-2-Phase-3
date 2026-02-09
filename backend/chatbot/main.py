from fastapi import FastAPI
from backend.chatbot.routes import chat
from backend.chatbot.database import create_tables
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database tables on startup
    await create_tables()
    yield
    # Cleanup operations can go here if needed

app = FastAPI(lifespan=lifespan)

# Include the chat routes
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo Chatbot API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)