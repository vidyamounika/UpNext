from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import re
import os
import json
import anthropic
from database import get_db
from models import User
from schemas import UserCreate
from auth import hash_password

from schemas import LoginRequest
from auth import verify_password
from schemas import OnboardingData
from schemas import ResetPassword
from auth import hash_password, verify_password

from models import (
    User,
    UserProfile,
    UserSkill,
    UserGoal
)


def validate_it_domain(current_role: str, target_role: str, skills: list) -> tuple:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return True, ""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        skills_str = ", ".join(skills) if skills else "none"

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Is this career profile IT/technology related?\n\n"
                        f"Current Role: {current_role}\n"
                        f"Target Role: {target_role}\n"
                        f"Skills: {skills_str}\n\n"
                        "IT/tech: software engineer, developer, data scientist, cloud, DevOps, cybersecurity, "
                        "networking, AI/ML, programming languages, frameworks, databases, etc.\n"
                        "Non-IT: doctor, chef, teacher, lawyer, nurse, etc.\n\n"
                        "Reply with exactly one line:\n"
                        "VALID - if all items are IT/tech related\n"
                        "INVALID: <which field is wrong and why, in 10 words max> - if any item is not IT/tech"
                    )
                }
            ]
        )

        response_text = message.content[0].text.strip()

        if response_text.startswith("VALID"):
            return True, ""

        reason = response_text.replace("INVALID:", "").replace("INVALID -", "").strip()
        return False, reason or "not related to the IT/technology domain"

    except Exception as e:
        print(f"IT validation error: {e}")
        if "credit balance is too low" in str(e) or "insufficient_quota" in str(e):
            return True, ""
        return False, "Validation service unavailable. Please try again."

def get_default_dashboard(full_name: str, target_role: str) -> dict:
    first_name = full_name.split()[0] if full_name else "there"
    return {
        "user_name": first_name,
        "target_role": target_role,
        "streak_days": 1,
        "overall_readiness": 50,
        "readiness_gap": 50,
        "skill_gap": {
            "skills": [
                {"name": "Technical Skills", "user_level": 50, "required": 80},
                {"name": "System Design", "user_level": 30, "required": 75},
                {"name": "Leadership", "user_level": 40, "required": 70},
                {"name": "Communication", "user_level": 60, "required": 65}
            ],
            "monthly_gain": 8
        },
        "roadmap": {
            "current_week": 1,
            "total_weeks": 12,
            "plan_duration": "3-month plan",
            "progress_percent": 5,
            "this_week_theme": "Foundation",
            "this_week_tasks": [
                {"task": "Set up your learning environment", "done": False},
                {"task": "Complete initial skill assessment", "done": False},
                {"task": "Join a relevant online community", "done": False}
            ],
            "phases": [
                {"month": 1, "name": "Foundations"},
                {"month": 2, "name": "Build"},
                {"month": 3, "name": "Apply"}
            ]
        },
        "career_insights": {
            "open_roles": 2500,
            "median_salary": "$120K",
            "demand_growth": "+15%",
            "top_skills": [
                {"skill": "Python", "demand": 90},
                {"skill": "Cloud", "demand": 85},
                {"skill": "System Design", "demand": 80},
                {"skill": "Leadership", "demand": 75},
                {"skill": "Communication", "demand": 70}
            ]
        },
        "gamification": {
            "level": 1,
            "level_name": "Career Starter",
            "current_xp": 0,
            "next_level_xp": 500,
            "next_level_name": "Skill Seeker",
            "weekly_xp": [0, 0, 0, 0, 0, 0, 0],
            "badges": [
                {"name": "Streak", "earned": False, "color": "#f97316"},
                {"name": "Builder", "earned": False, "color": "#7c3aed"},
                {"name": "Top 10%", "earned": False, "color": "#3b82f6"},
                {"name": "Certified", "earned": False, "color": "#06b6d4"},
                {"name": "Interview", "earned": False, "color": "#6b7280"},
                {"name": "Staff", "earned": False, "color": "#6b7280"}
            ]
        }
    }


def generate_dashboard_data(full_name: str, current_role: str, target_role: str,
                             experience: str, skills: list, timeline: str, primary_goal: str) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return get_default_dashboard(full_name, target_role)

    try:
        client = anthropic.Anthropic(api_key=api_key)
        first_name = full_name.split()[0] if full_name else "there"
        skills_str = ", ".join(skills) if skills else "various IT skills"

        prompt = f"""Generate a personalized career dashboard JSON for this user. Return ONLY valid JSON, no markdown, no explanation.

User Profile:
- Name: {full_name} (use first name: {first_name})
- Current Role: {current_role}
- Target Role: {target_role}
- Experience: {experience}
- Skills: {skills_str}
- Timeline: {timeline}
- Primary Goal: {primary_goal}

Return this EXACT JSON structure with realistic values personalized to their profile:
{{
  "user_name": "{first_name}",
  "target_role": "{target_role}",
  "streak_days": 1,
  "overall_readiness": <integer 40-80 based on skill gap from {current_role} to {target_role}>,
  "readiness_gap": <100 minus overall_readiness>,
  "skill_gap": {{
    "skills": [
      {{"name": "<key skill area 1 for {target_role}>", "user_level": <0-100>, "required": <60-95>}},
      {{"name": "<key skill area 2>", "user_level": <0-100>, "required": <60-95>}},
      {{"name": "<key skill area 3>", "user_level": <0-100>, "required": <60-95>}},
      {{"name": "<key skill area 4>", "user_level": <0-100>, "required": <60-95>}}
    ],
    "monthly_gain": <5-15>
  }},
  "roadmap": {{
    "current_week": 1,
    "total_weeks": <12 for 3 months, 24 for 6 months, 36 for 9 months, 48 for 12 months>,
    "plan_duration": "{timeline} plan",
    "progress_percent": 5,
    "this_week_theme": "<relevant first week topic for {current_role} to {target_role}>",
    "this_week_tasks": [
      {{"task": "<specific week 1 task>", "done": false}},
      {{"task": "<specific week 1 task>", "done": false}},
      {{"task": "<specific week 1 task>", "done": false}}
    ],
    "phases": [
      {{"month": 1, "name": "Foundations"}},
      {{"month": 2, "name": "Build"}},
      {{"month": 3, "name": "Interview"}},
      {{"month": 4, "name": "Apply"}}
    ]
  }},
  "career_insights": {{
    "open_roles": <realistic job count for {target_role}>,
    "median_salary": "<realistic salary like $120K>",
    "demand_growth": "<like +18%>",
    "top_skills": [
      {{"skill": "<in-demand skill 1 for {target_role}>", "demand": <70-100>}},
      {{"skill": "<skill 2>", "demand": <70-100>}},
      {{"skill": "<skill 3>", "demand": <70-100>}},
      {{"skill": "<skill 4>", "demand": <70-100>}},
      {{"skill": "<skill 5>", "demand": <70-100>}}
    ]
  }},
  "gamification": {{
    "level": 1,
    "level_name": "Career Starter",
    "current_xp": 0,
    "next_level_xp": 500,
    "next_level_name": "Skill Seeker",
    "weekly_xp": [0, 0, 0, 0, 0, 0, 0],
    "badges": [
      {{"name": "Streak", "earned": false, "color": "#f97316"}},
      {{"name": "Builder", "earned": false, "color": "#7c3aed"}},
      {{"name": "Top 10%", "earned": false, "color": "#3b82f6"}},
      {{"name": "Certified", "earned": false, "color": "#06b6d4"}},
      {{"name": "Interview", "earned": false, "color": "#6b7280"}},
      {{"name": "Staff", "earned": false, "color": "#6b7280"}}
    ]
  }}
}}"""

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        return json.loads(response_text)

    except Exception as e:
        print(f"Dashboard generation error: {e}")
        return get_default_dashboard(full_name, target_role)


app = FastAPI()

# ADD THIS PART
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# EXISTING CODE
@app.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        return {
            "message": "Email already exists"
        }

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "Signup Successful"
    }



@app.post("/login")
def login(
    user: LoginRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        return {
            "message": "User not found"
        }

    if not verify_password(
        user.password,
        existing_user.password
    ):
        return {
            "message": "Invalid Password"
        }

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == existing_user.id
    ).first()

    return {
        "message": "Login Successful",
        "onboarding_complete": profile is not None
    }


@app.post("/save-onboarding")
def save_onboarding(
    data: OnboardingData,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    is_valid, _ = validate_it_domain(
        data.current_role,
        data.target_role,
        data.skills
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Please enter valid IT roles and skills."
        )

    profile = UserProfile(
        user_id=user.id,
        current_role=data.current_role,
        experience=data.experience,
        target_role=data.target_role
    )

    db.add(profile)

    for skill in data.skills:

        db.add(
            UserSkill(
                user_id=user.id,
                skill_name=skill
            )
        )

    goal = UserGoal(
        user_id=user.id,
        timeline=data.timeline,
        goal=data.primary_goal
    )

    db.add(goal)

    db.commit()

    return {
        "message": "Onboarding Saved Successfully"
    }

@app.get("/dashboard-data")
def get_dashboard_data(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding.")

    skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    goal = db.query(UserGoal).filter(UserGoal.user_id == user.id).first()

    dashboard_data = generate_dashboard_data(
        full_name=user.full_name,
        current_role=profile.current_role,
        target_role=profile.target_role,
        experience=profile.experience,
        skills=[s.skill_name for s in skills],
        timeline=goal.timeline if goal else "3 months",
        primary_goal=goal.goal if goal else ""
    )

    return dashboard_data

@app.post("/reset-password")
def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    old_password_same = verify_password(
        data.new_password,
        user.password
    )

    if old_password_same:
        raise HTTPException(
            status_code=400,
            detail="New password cannot be same as old password"
        )
    
    
    if not re.match(
        r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$",
        data.new_password
    ):
    
        raise HTTPException(
            status_code=400,
            detail="Weak password"
        )


    user.password = hash_password(
        data.new_password
    )

    db.commit()

    return {
        "message": "Password reset successful"
    }

