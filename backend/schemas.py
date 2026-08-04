from pydantic import BaseModel

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class OnboardingData(BaseModel):

    email: str

    current_role: str

    experience: str

    target_role: str

    skills: list[str]

    timeline: str

    primary_goal: str

class ResetPassword(BaseModel):
    email: str
    new_password: str