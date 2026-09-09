from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import re, os, json
import httpx

from database import Base, engine, get_db, SessionLocal
from models import User, UserProfile, UserSkill, UserGoal, RoleSkill, RoadmapProgress
from schemas import UserCreate, LoginRequest, OnboardingData, ResetPassword, ProgressSave
from auth import hash_password, verify_password

# ─── Role → Required Skills seed data ────────────────────────────
ROLE_SKILLS_SEED = {
    "software engineer": [
        ("Python", 70), ("Data Structures", 75), ("Algorithms", 75),
        ("Git", 65), ("SQL", 60), ("REST APIs", 70), ("System Design", 70), ("OOP", 75),
    ],
    "senior software engineer": [
        ("Python", 80), ("Data Structures", 85), ("Algorithms", 85),
        ("System Design", 85), ("Git", 75), ("SQL", 70),
        ("Leadership", 65), ("Code Review", 70), ("Architecture", 75),
    ],
    "data scientist": [
        ("Python", 80), ("Machine Learning", 80), ("Statistics", 75),
        ("SQL", 70), ("Data Visualization", 65), ("Pandas", 75),
        ("NumPy", 70), ("Deep Learning", 65), ("Feature Engineering", 70),
    ],
    "machine learning engineer": [
        ("Python", 85), ("TensorFlow", 75), ("PyTorch", 75),
        ("MLOps", 70), ("Docker", 65), ("SQL", 65),
        ("Statistics", 75), ("Data Pipelines", 70), ("REST APIs", 65),
    ],
    "ai engineer": [
        ("Python", 85), ("Machine Learning", 80), ("Deep Learning", 75),
        ("LLMs", 70), ("REST APIs", 70), ("Docker", 65),
        ("Data Preprocessing", 75), ("PyTorch", 70), ("MLOps", 65),
    ],
    "devops engineer": [
        ("Linux", 80), ("Docker", 80), ("Kubernetes", 75),
        ("CI/CD", 75), ("AWS", 70), ("Terraform", 65),
        ("Bash Scripting", 70), ("Monitoring", 65), ("Networking", 65),
    ],
    "cloud engineer": [
        ("AWS", 80), ("Azure", 70), ("GCP", 65),
        ("Terraform", 75), ("Docker", 70), ("Kubernetes", 70),
        ("Networking", 70), ("Security", 65), ("Linux", 70),
    ],
    "cloud architect": [
        ("AWS", 85), ("System Design", 85), ("Networking", 80),
        ("Security", 80), ("Terraform", 75), ("Microservices", 75),
        ("Cost Optimization", 70), ("Leadership", 65), ("Azure", 65),
    ],
    "frontend developer": [
        ("HTML", 80), ("CSS", 80), ("JavaScript", 85),
        ("React", 80), ("TypeScript", 70), ("Git", 65),
        ("Responsive Design", 75), ("REST APIs", 65), ("Testing", 60),
    ],
    "backend developer": [
        ("Python", 80), ("REST APIs", 80), ("SQL", 80),
        ("NoSQL", 65), ("Docker", 65), ("Git", 70),
        ("System Design", 70), ("Authentication", 65), ("Testing", 65),
    ],
    "full stack developer": [
        ("JavaScript", 80), ("React", 75), ("Python", 75),
        ("SQL", 70), ("REST APIs", 75), ("Git", 70),
        ("Docker", 60), ("CSS", 70), ("System Design", 65),
    ],
    "data engineer": [
        ("Python", 80), ("SQL", 85), ("Apache Spark", 70),
        ("Kafka", 65), ("AWS", 65), ("ETL", 80),
        ("Data Warehousing", 70), ("Docker", 60), ("Airflow", 65),
    ],
    "cybersecurity engineer": [
        ("Network Security", 80), ("Penetration Testing", 75),
        ("Python", 65), ("Linux", 75), ("SIEM", 65),
        ("Incident Response", 70), ("Firewall", 65), ("Cryptography", 65), ("Compliance", 60),
    ],
    "site reliability engineer": [
        ("Linux", 80), ("Docker", 75), ("Kubernetes", 75),
        ("Python", 70), ("Monitoring", 80), ("CI/CD", 70),
        ("Incident Management", 75), ("AWS", 65), ("Automation", 75),
    ],
    "mobile developer": [
        ("Swift", 70), ("Kotlin", 70), ("React Native", 70),
        ("REST APIs", 75), ("Git", 70), ("UI Design", 65),
        ("Testing", 65), ("Performance Optimization", 65), ("JavaScript", 65),
    ],
    "qa engineer": [
        ("Testing", 85), ("Selenium", 75), ("Python", 65),
        ("API Testing", 75), ("Git", 65), ("SQL", 65),
        ("CI/CD", 60), ("Bug Tracking", 70), ("Test Planning", 75),
    ],
    "database administrator": [
        ("SQL", 90), ("PostgreSQL", 80), ("MySQL", 75),
        ("Performance Tuning", 75), ("Backup & Recovery", 75),
        ("Linux", 65), ("Monitoring", 65), ("Security", 65), ("Replication", 65),
    ],
    "network engineer": [
        ("Networking", 85), ("TCP/IP", 80), ("Routing", 80),
        ("Switching", 75), ("Firewall", 70), ("Linux", 65),
        ("Cisco", 70), ("VPN", 65), ("Monitoring", 65),
    ],
    "technical lead": [
        ("System Design", 85), ("Leadership", 85), ("Code Review", 80),
        ("Architecture", 80), ("Communication", 80), ("Mentoring", 75),
        ("Agile", 70), ("Python", 70), ("Project Management", 65),
    ],
    "product manager": [
        ("Agile", 80), ("JIRA", 70), ("User Stories", 75),
        ("Data Analysis", 65), ("Communication", 80), ("Roadmap Planning", 75),
        ("SQL", 55), ("Stakeholder Management", 75), ("A/B Testing", 65),
    ],
}

# ─── Career insights per role family (hardcoded, no LLM needed) ──
CAREER_INSIGHTS_BY_ROLE = {
    "data scientist": {
        "open_roles": 18000, "median_salary": "₹18 LPA", "demand_growth": "+35%",
        "top_skills": [
            {"skill": "Python", "demand": 95}, {"skill": "Machine Learning", "demand": 90},
            {"skill": "SQL", "demand": 85}, {"skill": "Statistics", "demand": 80}, {"skill": "Deep Learning", "demand": 75},
        ],
    },
    "machine learning": {
        "open_roles": 12000, "median_salary": "₹22 LPA", "demand_growth": "+42%",
        "top_skills": [
            {"skill": "Python", "demand": 98}, {"skill": "PyTorch", "demand": 88},
            {"skill": "TensorFlow", "demand": 85}, {"skill": "MLOps", "demand": 80}, {"skill": "Statistics", "demand": 78},
        ],
    },
    "ai engineer": {
        "open_roles": 10000, "median_salary": "₹24 LPA", "demand_growth": "+48%",
        "top_skills": [
            {"skill": "Python", "demand": 98}, {"skill": "LLMs", "demand": 90},
            {"skill": "PyTorch", "demand": 85}, {"skill": "MLOps", "demand": 80}, {"skill": "REST APIs", "demand": 75},
        ],
    },
    "software engineer": {
        "open_roles": 45000, "median_salary": "₹14 LPA", "demand_growth": "+22%",
        "top_skills": [
            {"skill": "Python", "demand": 92}, {"skill": "JavaScript", "demand": 87},
            {"skill": "System Design", "demand": 82}, {"skill": "AWS", "demand": 76}, {"skill": "Git", "demand": 70},
        ],
    },
    "devops": {
        "open_roles": 22000, "median_salary": "₹16 LPA", "demand_growth": "+28%",
        "top_skills": [
            {"skill": "Kubernetes", "demand": 90}, {"skill": "Docker", "demand": 88},
            {"skill": "AWS", "demand": 85}, {"skill": "Terraform", "demand": 80}, {"skill": "CI/CD", "demand": 78},
        ],
    },
    "cloud": {
        "open_roles": 30000, "median_salary": "₹18 LPA", "demand_growth": "+32%",
        "top_skills": [
            {"skill": "AWS", "demand": 92}, {"skill": "Azure", "demand": 85},
            {"skill": "Kubernetes", "demand": 82}, {"skill": "Terraform", "demand": 78}, {"skill": "Security", "demand": 75},
        ],
    },
    "cybersecurity": {
        "open_roles": 25000, "median_salary": "₹15 LPA", "demand_growth": "+30%",
        "top_skills": [
            {"skill": "Network Security", "demand": 90}, {"skill": "Python", "demand": 82},
            {"skill": "Penetration Testing", "demand": 80}, {"skill": "SIEM", "demand": 76}, {"skill": "Compliance", "demand": 72},
        ],
    },
    "frontend": {
        "open_roles": 35000, "median_salary": "₹12 LPA", "demand_growth": "+18%",
        "top_skills": [
            {"skill": "React", "demand": 92}, {"skill": "TypeScript", "demand": 88},
            {"skill": "JavaScript", "demand": 95}, {"skill": "CSS", "demand": 82}, {"skill": "Testing", "demand": 72},
        ],
    },
    "backend": {
        "open_roles": 38000, "median_salary": "₹14 LPA", "demand_growth": "+20%",
        "top_skills": [
            {"skill": "Python", "demand": 88}, {"skill": "REST APIs", "demand": 90},
            {"skill": "SQL", "demand": 85}, {"skill": "Docker", "demand": 78}, {"skill": "System Design", "demand": 82},
        ],
    },
    "full stack": {
        "open_roles": 32000, "median_salary": "₹13 LPA", "demand_growth": "+20%",
        "top_skills": [
            {"skill": "JavaScript", "demand": 93}, {"skill": "React", "demand": 88},
            {"skill": "Node.js", "demand": 85}, {"skill": "SQL", "demand": 80}, {"skill": "Docker", "demand": 75},
        ],
    },
    "data engineer": {
        "open_roles": 14000, "median_salary": "₹16 LPA", "demand_growth": "+30%",
        "top_skills": [
            {"skill": "Python", "demand": 90}, {"skill": "SQL", "demand": 92},
            {"skill": "Spark", "demand": 80}, {"skill": "Airflow", "demand": 75}, {"skill": "Kafka", "demand": 72},
        ],
    },
    "mobile": {
        "open_roles": 20000, "median_salary": "₹12 LPA", "demand_growth": "+16%",
        "top_skills": [
            {"skill": "React Native", "demand": 85}, {"skill": "Swift", "demand": 80},
            {"skill": "Kotlin", "demand": 78}, {"skill": "REST APIs", "demand": 82}, {"skill": "Testing", "demand": 70},
        ],
    },
    "sre": {
        "open_roles": 18000, "median_salary": "₹18 LPA", "demand_growth": "+26%",
        "top_skills": [
            {"skill": "Kubernetes", "demand": 90}, {"skill": "Linux", "demand": 88},
            {"skill": "Monitoring", "demand": 85}, {"skill": "Python", "demand": 80}, {"skill": "Automation", "demand": 78},
        ],
    },
}

# ─── IT domain keywords for validation ───────────────────────────

# Roles that are clearly NOT IT — hard block these
NON_IT_ROLE_BLOCKLIST = {
    "nurse", "doctor", "physician", "surgeon", "dentist", "pharmacist",
    "teacher", "professor", "lecturer", "principal", "tutor",
    "lawyer", "attorney", "judge", "paralegal",
    "accountant", "auditor", "banker", "financial advisor", "broker",
    "chef", "cook", "baker", "waiter", "bartender",
    "driver", "pilot", "mechanic", "plumber", "electrician", "carpenter",
    "farmer", "gardener", "cleaner", "janitor",
    "police", "soldier", "firefighter", "paramedic",
    "journalist", "reporter", "editor", "writer", "author",
    "artist", "painter", "musician", "actor", "dancer",
    "psychologist", "therapist", "counselor", "social worker",
    "hr", "recruiter", "receptionist", "secretary",
    "sales", "marketing", "cashier", "retail",
    "testing", "tester",  # too vague — must be "qa engineer" or "test engineer"
}

# Roles that are clearly IT — allow these
IT_ROLE_ALLOWLIST = {
    "software engineer", "software developer", "senior software engineer",
    "frontend developer", "frontend engineer", "backend developer", "backend engineer",
    "full stack developer", "full stack engineer", "fullstack developer",
    "data scientist", "data analyst", "data engineer",
    "machine learning engineer", "ml engineer", "ai engineer",
    "devops engineer", "devops", "site reliability engineer", "sre",
    "cloud engineer", "cloud architect", "cloud developer",
    "cybersecurity engineer", "security engineer", "network engineer",
    "mobile developer", "ios developer", "android developer",
    "qa engineer", "test engineer", "automation engineer",
    "database administrator", "dba", "systems administrator",
    "technical lead", "tech lead", "engineering manager",
    "product manager", "scrum master", "platform engineer",
    "solutions architect", "enterprise architect", "it architect",
    "programmer", "coder", "software architect", "infrastructure engineer",
    "devsecops", "mlops engineer", "data platform engineer",
}

# IT keyword fragments — a role must contain at least one of these
IT_ROLE_KEYWORDS = {
    "software", "developer", "engineer", "scientist", "architect",
    "devops", "cloud", "frontend", "backend", "fullstack", "full stack",
    "mobile", "qa", "sre", "ml", "ai", "programmer", "coder",
    "infrastructure", "dba", "technical lead", "tech lead",
    "scrum", "platform", "devsecops", "site reliability",
    "cybersecurity", "network engineer", "data engineer",
    "data scientist", "data analyst", "machine learning",
    "automation engineer", "test engineer", "solutions architect",
}

# Built from ROLE_SKILLS_SEED + common IT terms — only these are accepted
IT_SKILL_WHITELIST = {
    s.lower() for skills in ROLE_SKILLS_SEED.values() for s, _ in skills
} | {
    # Languages
    "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "rust",
    "kotlin", "swift", "php", "ruby", "scala", "r", "matlab", "bash", "shell",
    "html", "css", "sass", "scss", "xml", "json", "yaml",
    # Frameworks & libraries
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "node.js", "express",
    "django", "flask", "fastapi", "spring", "spring boot", "laravel", "rails",
    "asp.net", ".net", "hibernate", "graphql", "redux", "tailwind",
    # Databases
    "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "cassandra",
    "dynamodb", "elasticsearch", "neo4j", "mariadb", "firebase",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "gitlab ci", "ci/cd", "linux", "nginx", "apache",
    "prometheus", "grafana", "datadog", "splunk", "helm", "istio",
    # ML / AI
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "matplotlib", "opencv", "hugging face", "langchain", "llms", "nlp",
    "computer vision", "deep learning", "machine learning", "mlops",
    "data science", "statistics", "feature engineering", "data visualization",
    # Tools & practices
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "agile",
    "scrum", "rest api", "rest apis", "graphql", "grpc", "microservices",
    "system design", "oop", "data structures", "algorithms", "design patterns",
    "tdd", "bdd", "unit testing", "selenium", "cypress", "jest", "pytest",
    "postman", "swagger", "oauth", "jwt", "websockets", "kafka", "rabbitmq",
    "airflow", "spark", "hadoop", "etl", "data warehousing", "tableau", "power bi",
    "networking", "tcp/ip", "dns", "vpn", "firewall", "cryptography",
    "penetration testing", "network security", "siem", "incident response",
    "react native", "flutter", "android", "ios", "xcode",
    "performance optimization", "caching", "load balancing", "api testing",
    "bug tracking", "test planning", "code review", "architecture", "mentoring",
    "leadership", "communication", "project management", "stakeholder management",
    "roadmap planning", "user stories", "a/b testing", "data analysis",
}


def validate_skills(skills: list) -> tuple:
    """Accepts a skill if it fuzzy-matches anything in IT_SKILL_WHITELIST."""
    for skill in skills:
        sl = skill.lower().strip()
        # Exact match
        if sl in IT_SKILL_WHITELIST:
            continue
        # Substring match — e.g. "react.js" matches "react", "aws lambda" matches "aws"
        if any(w in sl or sl in w for w in IT_SKILL_WHITELIST if len(w) >= 3):
            continue
        return False, f"'{skill}' is not a recognized IT skill. Please enter skills like Python, React, AWS, Docker, SQL, etc."
    return True, ""


# ─── IT validation (strict) ───────────────────────────────────────
def validate_it_domain(current_role: str, target_role: str, skills: list) -> tuple:
    ERROR_MSG = "UpNext only supports IT/technology roles. Please enter roles like Software Engineer, Data Scientist, DevOps Engineer, etc."

    def is_blocked(role: str) -> bool:
        rl = role.lower().strip()
        if rl in NON_IT_ROLE_BLOCKLIST:
            return True
        words = set(rl.split())
        return bool(words & NON_IT_ROLE_BLOCKLIST)

    def is_it_role(role: str) -> bool:
        rl = role.lower().strip()
        if rl in IT_ROLE_ALLOWLIST:
            return True
        if is_blocked(rl):
            return False
        return any(kw in rl for kw in IT_ROLE_KEYWORDS)

    if not is_it_role(target_role):
        return False, ERROR_MSG

    if is_blocked(current_role) and not is_it_role(current_role):
        return False, ERROR_MSG

    # Validate each skill individually via LLM
    skill_valid, skill_reason = validate_skills(skills)
    if not skill_valid:
        return False, skill_reason

    # At least one IT skill must be present
    IT_SKILL_KEYWORDS = {
        "python", "java", "javascript", "typescript", "react", "angular",
        "vue", "node", "sql", "mongodb", "aws", "azure", "gcp", "docker",
        "kubernetes", "git", "linux", "html", "css", "machine learning",
        "tensorflow", "pytorch", "spark", "terraform", "rest api",
        "devops", "ci/cd", "microservices", "fastapi", "django", "flask",
        "postgresql", "mysql", "redis", "kafka", "airflow", "selenium",
        "system design", "algorithms", "data structures", "oop", "rest apis",
        "typescript", "kotlin", "swift", "go", "rust", "c++", "c#", "php",
    }
    skill_text = " ".join(s.lower() for s in skills)
    if not any(kw in skill_text for kw in IT_SKILL_KEYWORDS):
        return False, "Please add at least one IT/technology skill (e.g., Python, JavaScript, AWS, Docker)."

    return True, ""


# ─── Skill gap calculation (pure Python + PostgreSQL) ────────────
def _fuzzy_match(user_skills: list, required_skill: str) -> bool:
    req = required_skill.lower()
    for s in user_skills:
        sl = s.lower()
        if sl in req or req in sl:
            return True
        if set(req.split()) & set(sl.split()):
            return True
    return False


def calculate_skill_gap(user_skills: list, target_role: str, db: Session) -> tuple:
    """Returns (skill_gap_dict, readiness_score 0-100)."""
    required = db.query(RoleSkill).filter(
        func.lower(RoleSkill.role_name) == target_role.lower()
    ).all()

    # Partial match if exact not found
    if not required:
        for word in target_role.lower().split():
            if len(word) > 3:
                required = db.query(RoleSkill).filter(
                    RoleSkill.role_name.ilike(f"%{word}%")
                ).all()
                if required:
                    break

    # Generic fallback when role not in DB
    if not required:
        class _G:
            def __init__(self, n, l):
                self.skill_name, self.required_level = n, l
        required = [
            _G("Programming", 70), _G("Problem Solving", 75),
            _G("Git", 65), _G("SQL", 60), _G("System Design", 65),
        ]

    skills_result, total_coverage = [], 0
    for req in required:
        has = _fuzzy_match(user_skills, req.skill_name)
        user_level = 75 if has else 0
        total_coverage += min(user_level, req.required_level) / req.required_level
        skills_result.append({
            "name": req.skill_name,
            "user_level": user_level,
            "required": req.required_level,
        })

    readiness = int((total_coverage / len(required)) * 100)
    readiness = max(20, min(90, readiness))
    return {"skills": skills_result, "monthly_gain": 8}, readiness


# ─── Career insights lookup ───────────────────────────────────────
def get_career_insights(target_role: str) -> dict:
    rl = target_role.lower()
    for key, data in CAREER_INSIGHTS_BY_ROLE.items():
        if key in rl:
            return data
    return {
        "open_roles": 20000, "median_salary": "₹13 LPA", "demand_growth": "+20%",
        "top_skills": [
            {"skill": "Programming", "demand": 88}, {"skill": "System Design", "demand": 82},
            {"skill": "Cloud", "demand": 78}, {"skill": "Communication", "demand": 75},
            {"skill": "Git", "demand": 70},
        ],
    }


# ─── Ollama roadmap generation ────────────────────────────────────
def generate_roadmap_ollama(current_role: str, target_role: str, experience: str,
                             timeline: str, skill_gaps: list) -> dict:
    critical_gaps = [s["name"] for s in skill_gaps if s["required"] - s["user_level"] > 20][:4]
    gaps_str = ", ".join(critical_gaps) if critical_gaps else f"{target_role} core skills"

    prompt = (
        "You are a career coach. Return ONLY a JSON object, no explanation, no markdown.\n"
        f"Transition: {current_role} → {target_role} | Experience: {experience} | Timeline: {timeline}\n"
        f"Critical skill gaps: {gaps_str}\n\n"
        'JSON format: {"this_week_theme":"<focus>","this_week_tasks":[{"task":"<t1>","done":false},'
        '{"task":"<t2>","done":false},{"task":"<t3>","done":false}],'
        '"phases":[{"month":1,"name":"<p1>"},{"month":2,"name":"<p2>"},{"month":3,"name":"<p3>"}]}'
    )

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                "http://localhost:11434/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False},
            )
        if resp.status_code == 200:
            text = resp.json().get("response", "").strip()
            # Strip markdown fences if present
            if "```" in text:
                for part in text.split("```"):
                    part = part.lstrip("json").strip()
                    if part.startswith("{"):
                        text = part
                        break
            start, end = text.find("{"), text.rfind("}") + 1
            if 0 <= start < end:
                return json.loads(text[start:end])
    except Exception as e:
        print(f"Ollama roadmap error: {e}")

    # Fallback when Ollama is not running
    first_gap = critical_gaps[0] if critical_gaps else "key skills"
    return {
        "this_week_theme": "Foundation & Assessment",
        "this_week_tasks": [
            {"task": f"Research {target_role} job postings and required skills", "done": False},
            {"task": f"Enroll in a {first_gap} course on Coursera or YouTube", "done": False},
            {"task": "Set up your study schedule and daily learning habit", "done": False},
        ],
        "phases": [
            {"month": 1, "name": "Foundations"},
            {"month": 2, "name": "Build Skills"},
            {"month": 3, "name": "Apply & Interview"},
        ],
    }


# ─── Assemble full dashboard payload ─────────────────────────────
def build_dashboard_data(full_name, current_role, target_role,
                          experience, skills, timeline, primary_goal, email, db):
    first_name = full_name.split()[0] if full_name else "there"
    skill_gap, readiness = calculate_skill_gap(skills, target_role, db)
    roadmap = generate_roadmap_ollama(current_role, target_role, experience, timeline, skill_gap["skills"])
    career = get_career_insights(target_role)
    total_weeks = {"3 months": 12, "6 months": 24, "9 months": 36, "12 months": 48}.get(timeline, 12)

    prog = db.query(RoadmapProgress).filter(RoadmapProgress.user_email == email).first()
    tasks_done = 0
    db_total = 0
    if prog:
        try:
            saved = json.loads(prog.tasks_json or "{}")
            tasks_done = sum(1 for v in saved.values() if v)
            db_total = prog.total_tasks
        except Exception:
            pass

    total_tasks_for_progress = db_total if db_total > 0 else total_weeks * 3
    progress_pct = round((tasks_done / total_tasks_for_progress) * 100) if total_tasks_for_progress > 0 else 0

    return {
        "user_name": first_name,
        "target_role": target_role,
        "streak_days": 1,
        "overall_readiness": readiness,
        "readiness_gap": 100 - readiness,
        "skill_gap": skill_gap,
        "roadmap": {
            "current_week": 1,
            "total_weeks": total_weeks,
            "plan_duration": f"{timeline} plan",
            "tasks_done": tasks_done,
            "total_tasks": db_total,
            "progress_pct": progress_pct,
            "this_week_theme": roadmap.get("this_week_theme", "Foundation"),
            "this_week_tasks": roadmap.get("this_week_tasks", []),
            "phases": roadmap.get("phases", [
                {"month": 1, "name": "Foundations"},
                {"month": 2, "name": "Build Skills"},
                {"month": 3, "name": "Apply & Interview"},
            ]),
        },
        "career_insights": career,
        "gamification": {
            "level": 1,
            "level_name": "Career Starter",
            "current_xp": 0,
            "next_level_xp": 500,
            "next_level_name": "Skill Seeker",
            "weekly_xp": [0, 0, 0, 0, 0, 0, 0],
            "badges": [
                {"name": "Streak",   "earned": False, "color": "#f97316"},
                {"name": "Builder",  "earned": False, "color": "#7c3aed"},
                {"name": "Top 10%",  "earned": False, "color": "#3b82f6"},
                {"name": "Certified","earned": False, "color": "#06b6d4"},
                {"name": "Interview","earned": False, "color": "#6b7280"},
                {"name": "Staff",    "earned": False, "color": "#6b7280"},
            ],
        },
    }


# ─── AI Analysis via Ollama ──────────────────────────────────────
def generate_ai_analysis_ollama(name: str, current_role: str, target_role: str, top_gaps: list) -> dict:
    gaps_str = ", ".join([g["name"] for g in top_gaps])
    prompt = (
        f"Career coach. {name} is transitioning from {current_role} to {target_role}.\n"
        f"Top skill gaps: {gaps_str}\n\n"
        "Return ONLY a JSON object, no explanation:\n"
        '{"intro":"Based on recent job postings, here are your top 3 priorities:","priorities":['
        '{"number":1,"title":"<short title>","description":"<2 sentences of specific advice>"},'
        '{"number":2,"title":"<short title>","description":"<2 sentences>"},'
        '{"number":3,"title":"<short title>","description":"<2 sentences>"}]}'
    )
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post("http://localhost:11434/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False})
        if resp.status_code == 200:
            text = resp.json().get("response", "").strip()
            if "```" in text:
                for part in text.split("```"):
                    part = part.lstrip("json").strip()
                    if part.startswith("{"):
                        text = part; break
            s, e = text.find("{"), text.rfind("}") + 1
            if 0 <= s < e:
                return json.loads(text[s:e])
    except Exception as ex:
        print(f"Ollama analysis error: {ex}")
    # Fallback
    prios = []
    for i, g in enumerate(top_gaps[:3]):
        prios.append({"number": i+1, "title": g["name"],
            "description": f"Developing strong {g['name']} skills is critical for {target_role} roles. Focus on hands-on projects and structured courses to build proficiency quickly."})
    return {"intro": f"Based on recent {target_role} job postings, here are your top 3 priorities:", "priorities": prios}


# ─── FastAPI app ──────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://up-next-nu.vercel.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(OperationalError)
async def db_wake_handler(request: Request, exc: OperationalError):
    return JSONResponse(
        status_code=503,
        content={"detail": "db_waking", "message": "Database is waking up. Retrying..."},
    )


@app.on_event("startup")
def startup():
    # Wrapped in try/except so a suspended NeonDB never blocks server startup.
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[startup] create_all skipped (DB unavailable): {e}")

    db = SessionLocal()
    try:
        if db.query(RoleSkill).count() == 0:
            for role, skills in ROLE_SKILLS_SEED.items():
                for skill_name, required_level in skills:
                    db.add(RoleSkill(role_name=role, skill_name=skill_name,
                                     required_level=required_level))
            db.commit()
            print(f"Seeded {db.query(RoleSkill).count()} role-skill records")
    except Exception as e:
        print(f"[startup] seed skipped (DB unavailable): {e}")
    finally:
        db.close()


# ─── Auth endpoints ───────────────────────────────────────────────
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        return {"message": "Email already exists"}
    db.add(User(full_name=user.full_name, email=user.email,
                password=hash_password(user.password)))
    db.commit()
    return {"message": "Signup Successful"}


@app.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if not existing:
        return {"message": "User not found"}
    if not verify_password(user.password, existing.password):
        return {"message": "Invalid Password"}
    profile = db.query(UserProfile).filter(UserProfile.user_id == existing.id).first()
    return {"message": "Login Successful", "onboarding_complete": profile is not None}


@app.post("/save-onboarding")
def save_onboarding(data: OnboardingData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "User not found"}

    is_valid, reason = validate_it_domain(data.current_role, data.target_role, data.skills)
    if not is_valid:
        raise HTTPException(status_code=400, detail=reason or "Please enter valid IT roles and skills.")

    db.add(UserProfile(user_id=user.id, current_role=data.current_role,
                       experience=data.experience, target_role=data.target_role))
    for skill in data.skills:
        db.add(UserSkill(user_id=user.id, skill_name=skill))
    db.add(UserGoal(user_id=user.id, timeline=data.timeline, goal=data.primary_goal))
    db.commit()
    return {"message": "Onboarding Saved Successfully"}


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

    data = build_dashboard_data(
        full_name=user.full_name,
        current_role=profile.current_role,
        target_role=profile.target_role,
        experience=profile.experience,
        skills=[s.skill_name for s in skills],
        timeline=goal.timeline if goal else "3 months",
        primary_goal=goal.goal if goal else "",
        email=email,
        db=db,
    )
    data["current_role"] = profile.current_role
    return data


@app.get("/roadmap-progress")
def get_roadmap_progress(email: str, db: Session = Depends(get_db)):
    prog = db.query(RoadmapProgress).filter(RoadmapProgress.user_email == email).first()
    if not prog:
        return {"tasks": {}, "total_tasks": 0}
    try:
        tasks = json.loads(prog.tasks_json or "{}")
    except Exception:
        tasks = {}
    return {"tasks": tasks, "total_tasks": prog.total_tasks}


@app.post("/roadmap-progress")
def save_roadmap_progress(body: ProgressSave, db: Session = Depends(get_db)):
    prog = db.query(RoadmapProgress).filter(RoadmapProgress.user_email == body.email).first()
    if prog:
        prog.tasks_json = json.dumps(body.tasks)
        prog.total_tasks = body.total_tasks
    else:
        prog = RoadmapProgress(
            user_email=body.email,
            tasks_json=json.dumps(body.tasks),
            total_tasks=body.total_tasks,
        )
        db.add(prog)
    db.commit()
    return {"status": "saved"}


@app.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(data.new_password, user.password):
        raise HTTPException(status_code=400, detail="New password cannot be same as old password")

    if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$", data.new_password):
        raise HTTPException(status_code=400, detail="Weak password")

    user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successful"}


@app.get("/skill-gap-data")
def get_skill_gap_data(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(404, "User not found")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    user_skills = [s.skill_name for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]
    skill_gap, readiness = calculate_skill_gap(user_skills, profile.target_role, db)
    first_name = user.full_name.split()[0]
    current_skills = [{"name": s, "level": 75} for s in user_skills]
    missing_skills = []
    for s in skill_gap["skills"]:
        if s["user_level"] == 0:
            gap = s["required"]
            if gap >= 70: priority = "critical"
            elif gap >= 55: priority = "high"
            elif gap >= 40: priority = "medium"
            else: priority = "low"
            effort = "High" if s["required"] >= 75 else ("Medium" if s["required"] >= 60 else "Low")
            missing_skills.append({"name": s["name"], "required": s["required"], "gap": gap, "priority": priority, "effort": effort})
    missing_skills.sort(key=lambda x: x["gap"], reverse=True)
    radar = [{"name": s, "level": 75} for s in user_skills[:3]] + [{"name": s["name"], "level": 0} for s in missing_skills[:3]]
    high_p = [s for s in missing_skills if s["gap"] >= 55]
    low_p = [s for s in missing_skills if s["gap"] < 55]
    matrix = {
        "quick_wins": [s["name"] for s in high_p if s["effort"] in ("Low", "Medium")],
        "major_projects": [s["name"] for s in high_p if s["effort"] == "High"],
        "fill_ins": [s["name"] for s in low_p if s["effort"] in ("Low", "Medium")],
        "hard_decisions": [s["name"] for s in low_p if s["effort"] == "High"],
    }
    ai_analysis = generate_ai_analysis_ollama(first_name, profile.current_role, profile.target_role, missing_skills[:3])
    return {
        "user_name": first_name, "current_role": profile.current_role, "target_role": profile.target_role,
        "readiness": readiness, "current_skills": current_skills, "missing_skills": missing_skills,
        "radar": radar, "matrix": matrix, "ai_analysis": ai_analysis,
    }


def generate_weeks_ollama(current_role: str, target_role: str, phases: list,
                           timeline: str, skill_gaps: list) -> list:
    """Generate week-by-week tasks via Ollama. Falls back to template if unavailable."""
    total_weeks = {"3 months": 12, "6 months": 24, "9 months": 36, "12 months": 48}.get(timeline, 12)
    # Only generate first 12 weeks max for speed
    gen_weeks = min(total_weeks, 12)

    critical_gaps = [s["name"] for s in skill_gaps if s.get("gap", s.get("required", 0)) >= 55][:4]
    gaps_str = ", ".join(critical_gaps) if critical_gaps else f"{target_role} core skills"
    phases_str = " → ".join([f"Month {p['month']}: {p['name']}" for p in phases])

    prompt = (
        f"Career coach. Generate {gen_weeks} weeks of learning tasks as JSON array.\n"
        f"From: {current_role} | To: {target_role} | Timeline: {timeline}\n"
        f"Phases: {phases_str}\n"
        f"Key skill gaps: {gaps_str}\n\n"
        f"Return ONLY a JSON array. 3 tasks per week. Make tasks specific and actionable:\n"
        f'[{{"week":1,"theme":"<topic>","tasks":[{{"task":"<specific task>","done":false}},{{"task":"<specific task>","done":false}},{{"task":"<specific task>","done":false}}]}}'
        f',{{"week":2,"theme":"<topic>","tasks":[...]}},...up to week {gen_weeks}]'
    )

    try:
        with httpx.Client(timeout=90.0) as client:
            resp = client.post("http://localhost:11434/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False})
        if resp.status_code == 200:
            text = resp.json().get("response", "").strip()
            if "```" in text:
                for part in text.split("```"):
                    part = part.lstrip("json").strip()
                    if part.startswith("["):
                        text = part; break
            start, end = text.find("["), text.rfind("]") + 1
            if 0 <= start < end:
                weeks = json.loads(text[start:end])
                # Ensure each week has correct structure
                result = []
                for w in weeks:
                    if isinstance(w, dict) and "week" in w and "tasks" in w:
                        result.append({
                            "week": w["week"],
                            "theme": w.get("theme", f"Week {w['week']}"),
                            "tasks": [{"task": t.get("task", t) if isinstance(t, dict) else str(t), "done": False}
                                     for t in w.get("tasks", [])[:3]]
                        })
                if result:
                    return result
    except Exception as e:
        print(f"Ollama weeks error: {e}")

    # Template fallback
    weeks = []
    week_num = 1
    for phase in phases:
        phase_weeks = 3  # 3 weeks per phase
        for pw in range(phase_weeks):
            if week_num > gen_weeks:
                break
            theme_map = [
                f"{phase['name']} — Foundations",
                f"{phase['name']} — Deep Dive",
                f"{phase['name']} — Practice & Apply",
            ]
            gap = critical_gaps[pw % len(critical_gaps)] if critical_gaps else "core skills"
            tasks = [
                {"task": f"Study {gap} fundamentals (2 hrs)", "done": False},
                {"task": f"Complete a hands-on {gap} exercise", "done": False},
                {"task": f"Review and summarize key learnings", "done": False},
            ]
            weeks.append({"week": week_num, "theme": theme_map[pw], "tasks": tasks})
            week_num += 1
        if week_num > gen_weeks:
            break
    return weeks


@app.get("/roadmap-data")
def get_roadmap_data(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(404, "User not found")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")

    skills = [s.skill_name for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]
    goal = db.query(UserGoal).filter(UserGoal.user_id == user.id).first()
    timeline = goal.timeline if goal else "3 months"

    skill_gap, readiness = calculate_skill_gap(skills, profile.target_role, db)

    total_weeks = {"3 months": 12, "6 months": 24, "9 months": 36, "12 months": 48}.get(timeline, 12)
    num_months = {"3 months": 3, "6 months": 6, "9 months": 9, "12 months": 12}.get(timeline, 3)

    # Build phases list
    phase_names = ["Foundations", "Build Skills", "Apply & Interview", "Land the Role",
                   "Deep Specialization", "Leadership & Growth", "Master Level", "Excellence",
                   "Advanced Practice", "Senior Track", "Expert Level", "Career Summit"]
    phases = [{"month": i+1, "name": phase_names[i] if i < len(phase_names) else f"Phase {i+1}"}
              for i in range(num_months)]

    # Generate weeks
    weeks = generate_weeks_ollama(profile.current_role, profile.target_role, phases, timeline, skill_gap["skills"])

    return {
        "user_name": user.full_name.split()[0],
        "target_role": profile.target_role,
        "current_role": profile.current_role,
        "timeline": timeline,
        "total_weeks": total_weeks,
        "num_months": num_months,
        "hours_per_week": "6-8",
        "phases": phases,
        "weeks": weeks,
    }
