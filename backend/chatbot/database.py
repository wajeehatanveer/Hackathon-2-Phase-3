from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import os

# Get database URL from environment, defaulting to the same as main app if available
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

# If a sync Postgres driver URL is provided, convert it to asyncpg form
# (e.g., postgresql:// -> postgresql+asyncpg://) so SQLAlchemy async engine works.
if DATABASE_URL.startswith("postgresql://"):
    # If the URL contains parameters like sslmode or channel_binding (e.g. Neon),
    # those can cause issues when passed through the asyncpg connector in this
    # local dev environment. For reliability in local runs, fall back to a local
    # sqlite DB if such params are present.
    if "sslmode=" in DATABASE_URL or "channel_binding=" in DATABASE_URL:
        DATABASE_URL = "sqlite+aiosqlite:///./chatbot_dev.db"
    else:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Create async session maker
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_session():
    async with AsyncSessionLocal() as session:
        yield session

async def create_tables():
    """Create all tables defined in the models"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)