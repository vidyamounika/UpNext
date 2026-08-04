"""
create_tables.py

Runs once to create all database tables defined in models.py.
Safe to re-run — only creates tables that don't already exist.
"""

from database import engine, Base
from models import User

Base.metadata.create_all(bind=engine)
"""
Scans all models inheriting from Base and creates their corresponding
tables in the Neon PostgreSQL database if they don't already exist.
"""

print("✅ Users table created")