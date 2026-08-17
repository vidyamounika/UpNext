"""
database.py

Sets up the SQLAlchemy connection to the Neon PostgreSQL database.
Provides the engine, session factory, and declarative base for models.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # test connection before each use; reconnects after NeonDB wakes
    pool_recycle=300,          # recycle connections every 5 min to avoid stale handles
    connect_args={"connect_timeout": 10},
)
"""
SQLAlchemy engine connected to the Neon PostgreSQL database using DATABASE_URL from .env.
"""

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
"""
Session factory for creating database sessions.
Each session is used to run queries and transactions.
"""

Base = declarative_base()
"""
Base class for all SQLAlchemy ORM models.
All table models must inherit from this.
"""
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

