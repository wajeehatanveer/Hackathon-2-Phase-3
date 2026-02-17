from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime



class User(SQLModel, table=True):
    __tablename__ = "users"
    
    email: str = Field(primary_key=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
