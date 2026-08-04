"""
models.py

Defines the SQLAlchemy ORM models (database tables) for the UpNext app.
"""

from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    """
    Represents the 'users' table in the database.

    Columns:
        id       -- Auto-incremented primary key.
        full_name -- Full name of the user.
        email    -- Unique email address of the user.
        password -- Hashed password of the user.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)

    current_role = Column(String)
    experience = Column(String)
    target_role = Column(String)

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)

    skill_name = Column(String)

class UserGoal(Base):
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)

    timeline = Column(String)
    goal = Column(String)
