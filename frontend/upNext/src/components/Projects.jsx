import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight,
  FaSun, FaPlus, FaGithub, FaExternalLinkAlt, FaCheck, FaLock
} from "react-icons/fa";
import "../styles/Projects.scss";

function getInitials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
}

const SKILL_PROJECTS = {
  "react": { title: "React Component Library", description: "Build a reusable UI component library (buttons, modals, forms) with Storybook documentation.", skills: ["React", "TypeScript", "Storybook"], estimatedTime: "2 weeks", difficulty: "Intermediate" },
  "typescript": { title: "TypeScript Utility CLI", description: "Build a command-line tool in TypeScript with argument parsing, file I/O, and error handling.", skills: ["TypeScript", "Node.js"], estimatedTime: "1 week", difficulty: "Intermediate" },
  "python": { title: "Python Automation Scripts", description: "Write Python scripts to automate repetitive tasks like file renaming, email sending, or web scraping.", skills: ["Python"], estimatedTime: "3 days", difficulty: "Beginner" },
  "sql": { title: "SQL Analytics Dashboard", description: "Write complex SQL queries on a public dataset and visualize results using a BI tool or Python.", skills: ["SQL", "Python", "Pandas"], estimatedTime: "1 week", difficulty: "Intermediate" },
  "docker": { title: "Dockerized Multi-Service App", description: "Containerize a web app with Docker Compose — separate containers for frontend, backend, and database.", skills: ["Docker", "Docker Compose"], estimatedTime: "1 week", difficulty: "Intermediate" },
  "kubernetes": { title: "Kubernetes Deployment", description: "Deploy a containerized app to a local Kubernetes cluster using Deployments, Services, and ConfigMaps.", skills: ["Kubernetes", "Docker", "YAML"], estimatedTime: "2 weeks", difficulty: "Advanced" },
  "aws": { title: "Serverless AWS App", description: "Build a serverless REST API using AWS Lambda, API Gateway, and DynamoDB with IAM roles.", skills: ["AWS", "Lambda", "DynamoDB"], estimatedTime: "2 weeks", difficulty: "Intermediate" },
  "machine learning": { title: "ML Model API", description: "Train a classification model and serve it as a REST API using FastAPI with a live prediction endpoint.", skills: ["Python", "Scikit-learn", "FastAPI"], estimatedTime: "2 weeks", difficulty: "Intermediate" },
  "tensorflow": { title: "Image Classifier", description: "Train a CNN image classifier on a public dataset (CIFAR-10 or custom) and deploy it with a web UI.", skills: ["TensorFlow", "Python", "Keras"], estimatedTime: "3 weeks", difficulty: "Advanced" },
  "pytorch": { title: "Custom Neural Network", description: "Implement and train a neural network from scratch in PyTorch on a real dataset with training curves.", skills: ["PyTorch", "Python"], estimatedTime: "2 weeks", difficulty: "Advanced" },
  "system design": { title: "System Design Case Study", description: "Design and document a scalable system (e.g., URL shortener, Twitter clone) with diagrams and trade-off analysis.", skills: ["System Design", "Architecture"], estimatedTime: "1 week", difficulty: "Advanced" },
  "linux": { title: "Linux Server Setup", description: "Set up a Linux VPS from scratch — configure SSH, firewall, Nginx, SSL, and deploy a web app.", skills: ["Linux", "Nginx", "Bash"], estimatedTime: "1 week", difficulty: "Intermediate" },
  "terraform": { title: "Cloud Infrastructure with Terraform", description: "Provision a full cloud environment (VPC, subnets, EC2, RDS) using Terraform with remote state.", skills: ["Terraform", "AWS", "HCL"], estimatedTime: "2 weeks", difficulty: "Advanced" },
  "mongodb": { title: "MongoDB REST API", description: "Build a CRUD API with Node.js/Express and MongoDB with schema validation and pagination.", skills: ["MongoDB", "Node.js", "Express"], estimatedTime: "1 week", difficulty: "Beginner" },
  "graphql": { title: "GraphQL API", description: "Replace a REST API with GraphQL — implement queries, mutations, subscriptions, and DataLoader.", skills: ["GraphQL", "Node.js"], estimatedTime: "2 weeks", difficulty: "Intermediate" },
  "redis": { title: "Caching Layer with Redis", description: "Add Redis caching to an existing API to reduce DB load — implement cache invalidation strategies.", skills: ["Redis", "Python", "Docker"], estimatedTime: "1 week", difficulty: "Intermediate" },
  "kafka": { title: "Event-Driven Pipeline", description: "Build a real-time data pipeline using Kafka producers and consumers with a processing microservice.", skills: ["Kafka", "Python", "Docker"], estimatedTime: "2 weeks", difficulty: "Advanced" },
  "selenium": { title: "Web Scraper & Test Suite", description: "Build an automated web scraper and test suite using Selenium with reporting and scheduling.", skills: ["Selenium", "Python"], estimatedTime: "1 week", difficulty: "Intermediate" },
  "swift": { title: "iOS Weather App", description: "Build a native iOS weather app using Swift and SwiftUI consuming a public weather API.", skills: ["Swift", "SwiftUI", "REST APIs"], estimatedTime: "2 weeks", difficulty: "Intermediate" },
  "kotlin": { title: "Android Task App", description: "Build an Android task manager app using Kotlin with Room database and Material Design.", skills: ["Kotlin", "Android", "Room"], estimatedTime: "2 weeks", difficulty: "Intermediate" },
};

function getSuggestedProjects(userSkills) {
  const matched = [];
  const seen = new Set();
  for (const skill of userSkills) {
    const sl = (skill.name || skill).toLowerCase();
    for (const [key, project] of Object.entries(SKILL_PROJECTS)) {
      if (!seen.has(key) && (sl.includes(key) || key.includes(sl))) {
        seen.add(key);
        matched.push({ ...project, id: `suggested_${key}`, status: "suggested", githubUrl: null, liveUrl: null, completed: false });
        if (matched.length >= 4) return matched;
      }
    }
  }
  return matched;
}

// Projects are generated based on the user's target role from dashboard data
function getProjectsForRole(targetRole) {
  const role = (targetRole || "").toLowerCase();

  const base = [
    {
      id: 1, title: "Personal Portfolio Website", difficulty: "Beginner",
      description: "Build a responsive portfolio to showcase your skills, projects, and resume to recruiters.",
      skills: ["HTML", "CSS", "JavaScript"], status: "recommended",
      estimatedTime: "1 week", githubUrl: null, liveUrl: null, completed: false,
    },
    {
      id: 2, title: "GitHub Profile README", difficulty: "Beginner",
      description: "Create a standout GitHub profile README with stats, skills, and project highlights.",
      skills: ["Markdown", "Git"], status: "recommended",
      estimatedTime: "1 day", githubUrl: null, liveUrl: null, completed: false,
    },
  ];

  if (role.includes("data scientist") || role.includes("ml") || role.includes("machine learning") || role.includes("ai")) {
    return [...base,
      { id: 3, title: "House Price Prediction", difficulty: "Intermediate", description: "Build an end-to-end ML pipeline to predict house prices using regression models and feature engineering.", skills: ["Python", "Pandas", "Scikit-learn"], status: "recommended", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 4, title: "Customer Churn Analysis", difficulty: "Intermediate", description: "Analyze customer data to predict churn using classification algorithms and visualize insights.", skills: ["Python", "Pandas", "Matplotlib"], status: "recommended", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 5, title: "NLP Sentiment Analyzer", difficulty: "Advanced", description: "Build a sentiment analysis tool using transformers or LSTM on real-world Twitter/review data.", skills: ["Python", "NLP", "PyTorch"], status: "locked", estimatedTime: "3 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 6, title: "End-to-End ML Dashboard", difficulty: "Advanced", description: "Deploy a trained ML model with a Streamlit or FastAPI dashboard showing predictions in real time.", skills: ["Python", "FastAPI", "Streamlit"], status: "locked", estimatedTime: "3 weeks", githubUrl: null, liveUrl: null, completed: false },
    ];
  }

  if (role.includes("frontend") || role.includes("react") || role.includes("ui")) {
    return [...base,
      { id: 3, title: "Weather App with API", difficulty: "Beginner", description: "Fetch real-time weather data from an API and display it with a clean, responsive UI.", skills: ["React", "CSS", "REST APIs"], status: "recommended", estimatedTime: "3 days", githubUrl: null, liveUrl: null, completed: false },
      { id: 4, title: "Task Manager App", difficulty: "Intermediate", description: "Build a full-featured task manager with drag-and-drop, filters, and local storage persistence.", skills: ["React", "TypeScript", "CSS"], status: "recommended", estimatedTime: "1 week", githubUrl: null, liveUrl: null, completed: false },
      { id: 5, title: "E-Commerce Product Page", difficulty: "Intermediate", description: "Create a pixel-perfect e-commerce product page with cart functionality and animations.", skills: ["React", "Redux", "SCSS"], status: "locked", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 6, title: "Real-Time Chat UI", difficulty: "Advanced", description: "Build a real-time chat interface with WebSocket integration, rooms, and message history.", skills: ["React", "WebSockets", "TypeScript"], status: "locked", estimatedTime: "3 weeks", githubUrl: null, liveUrl: null, completed: false },
    ];
  }

  if (role.includes("backend") || role.includes("python") || role.includes("node")) {
    return [...base,
      { id: 3, title: "REST API with FastAPI", difficulty: "Beginner", description: "Build a CRUD REST API with authentication, database integration, and Swagger docs.", skills: ["Python", "FastAPI", "PostgreSQL"], status: "recommended", estimatedTime: "1 week", githubUrl: null, liveUrl: null, completed: false },
      { id: 4, title: "URL Shortener Service", difficulty: "Intermediate", description: "Create a URL shortener with analytics, rate limiting, and Redis caching.", skills: ["Python", "Redis", "Docker"], status: "recommended", estimatedTime: "1 week", githubUrl: null, liveUrl: null, completed: false },
      { id: 5, title: "Job Board API", difficulty: "Intermediate", description: "Build a full job board backend with search, filters, pagination, and JWT auth.", skills: ["Python", "FastAPI", "SQL"], status: "locked", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 6, title: "Microservices with Docker", difficulty: "Advanced", description: "Decompose a monolith into microservices using Docker Compose and an API gateway.", skills: ["Docker", "Python", "REST APIs"], status: "locked", estimatedTime: "4 weeks", githubUrl: null, liveUrl: null, completed: false },
    ];
  }

  if (role.includes("devops") || role.includes("cloud") || role.includes("sre")) {
    return [...base,
      { id: 3, title: "CI/CD Pipeline with GitHub Actions", difficulty: "Beginner", description: "Set up a full CI/CD pipeline that runs tests, builds Docker images, and deploys automatically.", skills: ["GitHub Actions", "Docker", "YAML"], status: "recommended", estimatedTime: "1 week", githubUrl: null, liveUrl: null, completed: false },
      { id: 4, title: "Infrastructure as Code with Terraform", difficulty: "Intermediate", description: "Provision AWS infrastructure (VPC, EC2, RDS) using Terraform modules.", skills: ["Terraform", "AWS", "HCL"], status: "recommended", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 5, title: "Kubernetes Cluster Setup", difficulty: "Advanced", description: "Deploy a multi-service app on Kubernetes with Helm charts, autoscaling, and monitoring.", skills: ["Kubernetes", "Helm", "Docker"], status: "locked", estimatedTime: "3 weeks", githubUrl: null, liveUrl: null, completed: false },
      { id: 6, title: "Monitoring Stack with Prometheus", difficulty: "Advanced", description: "Set up Prometheus + Grafana to monitor a live application with custom dashboards and alerts.", skills: ["Prometheus", "Grafana", "Linux"], status: "locked", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
    ];
  }

  // Full stack / default
  return [...base,
    { id: 3, title: "Full Stack Todo App", difficulty: "Beginner", description: "Build a full stack todo app with React frontend, FastAPI backend, and PostgreSQL database.", skills: ["React", "Python", "PostgreSQL"], status: "recommended", estimatedTime: "1 week", githubUrl: null, liveUrl: null, completed: false },
    { id: 4, title: "Blog Platform", difficulty: "Intermediate", description: "Create a blog platform with user auth, markdown editor, comments, and image uploads.", skills: ["React", "Node.js", "MongoDB"], status: "recommended", estimatedTime: "2 weeks", githubUrl: null, liveUrl: null, completed: false },
    { id: 5, title: "Real-Time Collaboration Tool", difficulty: "Advanced", description: "Build a Google Docs-like editor with real-time sync using WebSockets and operational transforms.", skills: ["React", "WebSockets", "Node.js"], status: "locked", estimatedTime: "4 weeks", githubUrl: null, liveUrl: null, completed: false },
    { id: 6, title: "SaaS Dashboard", difficulty: "Advanced", description: "Build a multi-tenant SaaS dashboard with billing, analytics, and role-based access control.", skills: ["React", "Python", "Stripe"], status: "locked", estimatedTime: "5 weeks", githubUrl: null, liveUrl: null, completed: false },
  ];
}

const DIFF_COLOR = { Beginner: "pj_diff_green", Intermediate: "pj_diff_blue", Advanced: "pj_diff_purple" };

function Projects() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("User");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [projects, setProjects] = useState([]);
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    const saved = localStorage.getItem("upnext_projects_done");
    if (saved) setCompleted(JSON.parse(saved));

    fetch(`http://127.0.0.1:8000/dashboard-data?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        setUserName(d.user_name || "User");
        setTargetRole(d.target_role || "Software Engineer");
        const skills = d.skill_gap?.skills || [];
        setProjects(getProjectsForRole(d.target_role));
        setSuggestedProjects(getSuggestedProjects(skills));
        setLoading(false);
      })
      .catch(() => { setProjects(getProjectsForRole("full stack")); setLoading(false); });
  }, []);

  const toggleComplete = (id) => {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    localStorage.setItem("upnext_projects_done", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects", active: true },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  const allProjects = [...suggestedProjects, ...projects];
  const doneCount = allProjects.filter(p => completed[p.id]).length;

  return (
    <div className={`pj_wrapper${darkMode ? " dark" : ""}`}>
      <aside className={`pj_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="pj_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="pj_logo">
          <div className="pj_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>
        <nav className="pj_nav">
          {navItems.map(item => (
            <div key={item.label} className={`pj_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}>
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="pj_sidebar_foot">
          <div className="pj_nav_item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="pj_nav_item pj_logout" onClick={handleLogout}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="pj_user_row">
              <div className="pj_avatar_sm">{getInitials(userName)}</div>
              <div>
                <p className="pj_user_name_text">{userName}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      <main className={`pj_main${collapsed ? " collapsed" : ""}`}>
        <header className="pj_header">
          <h2 className="pj_page_title">Projects</h2>
          <div className="pj_search_box">
            <FaSearch /><input type="text" placeholder="Search..." />
          </div>
          <div className="pj_header_right">
            <div className="pj_icon_btn"><FaBell /></div>
            <div className="pj_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="pj_avatar_sm purple">{getInitials(userName)}</div>
          </div>
        </header>

        <div className="pj_content">
          <div className="pj_intro">
            <div>
              <h1>Recommended Projects</h1>
              <p className="pj_intro_sub">Hands-on projects tailored for your <strong>{targetRole}</strong> journey</p>
            </div>
            <div className="pj_progress_chip">
              <FaCheck /> {doneCount}/{allProjects.length} completed
            </div>
          </div>

          {/* Progress bar */}
          <div className="pj_card pj_progress_card">
            <div className="pj_prog_row">
              <span>Project Completion</span>
              <span>{allProjects.length ? Math.round((doneCount / allProjects.length) * 100) : 0}%</span>
            </div>
            <div className="pj_prog_track">
              <div className="pj_prog_fill" style={{ width: allProjects.length ? `${(doneCount / allProjects.length) * 100}%` : "0%" }} />
            </div>
            <p className="pj_prog_hint">Complete projects to build your portfolio and boost your readiness score</p>
          </div>

          {/* Skill-based suggested projects */}
          {loading ? (
            <div className="pj_loading">
              <div className="pj_spinner" />
              <p>Loading your personalized projects...</p>
            </div>
          ) : suggestedProjects.length > 0 && (
            <>
              <h2 className="pj_section_title">✨ Suggested Based on Your Skills</h2>
              <div className="pj_grid">
                {suggestedProjects.map(project => {
                  const done = !!completed[project.id];
                  return (
                    <div key={project.id} className={`pj_project_card suggested${done ? " done" : ""}`}>
                      <div className="pj_project_top">
                        <div className="pj_project_meta">
                          <span className={`pj_diff_badge ${DIFF_COLOR[project.difficulty]}`}>{project.difficulty}</span>
                          <span className="pj_suggested_badge">⚡ Skill Match</span>
                        </div>
                        <div className={`pj_check_btn${done ? " checked" : ""}`} onClick={() => toggleComplete(project.id)}>
                          {done ? <FaCheck /> : <span />}
                        </div>
                      </div>
                      <h3 className="pj_project_title">{project.title}</h3>
                      <p className="pj_project_desc">{project.description}</p>
                      <div className="pj_skills_row">
                        {project.skills.map(s => <span key={s} className="pj_skill_tag">{s}</span>)}
                      </div>
                      <div className="pj_project_footer">
                        <span className="pj_time">⏱ {project.estimatedTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Role-based projects */}
          {!loading && <h2 className="pj_section_title">🎯 Role-Based Projects</h2>}
          {/* Project cards */}
          <div className="pj_grid">
            {projects.map(project => {
              const done = !!completed[project.id];
              const locked = project.status === "locked";
              return (
                <div key={project.id} className={`pj_project_card${done ? " done" : ""}${locked ? " locked" : ""}`}>
                  <div className="pj_project_top">
                    <div className="pj_project_meta">
                      <span className={`pj_diff_badge ${DIFF_COLOR[project.difficulty]}`}>{project.difficulty}</span>
                      {locked && <span className="pj_locked_badge"><FaLock /> Locked</span>}
                    </div>
                    <div className={`pj_check_btn${done ? " checked" : ""}`} onClick={() => !locked && toggleComplete(project.id)}>
                      {done ? <FaCheck /> : <span />}
                    </div>
                  </div>

                  <h3 className="pj_project_title">{project.title}</h3>
                  <p className="pj_project_desc">{project.description}</p>

                  <div className="pj_skills_row">
                    {project.skills.map(s => <span key={s} className="pj_skill_tag">{s}</span>)}
                  </div>

                  <div className="pj_project_footer">
                    <span className="pj_time">⏱ {project.estimatedTime}</span>
                    <div className="pj_links">
                      {project.githubUrl
                        ? <a href={project.githubUrl} target="_blank" rel="noreferrer"><FaGithub /> GitHub</a>
                        : <span className="pj_link_placeholder"><FaGithub /> Add GitHub</span>
                      }
                      {project.liveUrl
                        ? <a href={project.liveUrl} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Live</a>
                        : <span className="pj_link_placeholder"><FaExternalLinkAlt /> Add Live URL</span>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom project */}
          <div className="pj_card pj_add_card" onClick={() => alert("Custom project builder coming soon!")}>
            <FaPlus className="pj_add_icon" />
            <p>Add Your Own Project</p>
            <span>Track a personal or work project</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Projects;
