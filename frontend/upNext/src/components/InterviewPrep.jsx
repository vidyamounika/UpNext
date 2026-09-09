import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight,
  FaSun, FaChevronDown, FaChevronUp, FaCheck, FaRedo
} from "react-icons/fa";
import "../styles/InterviewPrep.scss";

function getInitials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
}

const SKILL_QUESTIONS = {
  "react": [
    { q: "What is the difference between useMemo and useCallback?", category: "Technical", tip: "useMemo memoizes a value, useCallback memoizes a function. Both prevent unnecessary re-renders." },
    { q: "How does React's reconciliation algorithm work?", category: "Technical", tip: "React diffs the virtual DOM tree and only updates nodes that changed. Keys help identify list items." },
  ],
  "typescript": [
    { q: "What is the difference between 'interface' and 'type' in TypeScript?", category: "Technical", tip: "Interfaces are extendable and better for objects. Types are more flexible — can represent unions, primitives, tuples." },
    { q: "What are TypeScript generics and when would you use them?", category: "Technical", tip: "Generics let you write reusable, type-safe code. Example: function identity<T>(arg: T): T." },
  ],
  "javascript": [
    { q: "Explain event delegation in JavaScript.", category: "Technical", tip: "Attach one listener to a parent instead of many children. Uses event bubbling — e.target identifies the clicked child." },
    { q: "What is the difference between == and === in JavaScript?", category: "Technical", tip: "== does type coercion, === checks value AND type. Always prefer ===." },
  ],
  "python": [
    { q: "What is the difference between a list and a tuple in Python?", category: "Technical", tip: "Lists are mutable, tuples are immutable. Tuples are faster and used for fixed data." },
    { q: "Explain Python decorators with an example.", category: "Technical", tip: "A decorator wraps a function to add behavior. @functools.wraps preserves the original function's metadata." },
  ],
  "sql": [
    { q: "What is the difference between INNER JOIN and LEFT JOIN?", category: "Technical", tip: "INNER JOIN returns only matching rows. LEFT JOIN returns all rows from the left table, NULLs for non-matches." },
    { q: "What are database indexes and how do they affect performance?", category: "Technical", tip: "Indexes speed up reads but slow down writes. Use on frequently filtered/sorted columns." },
  ],
  "docker": [
    { q: "What is the difference between a Docker image and a container?", category: "Technical", tip: "Image = blueprint (read-only). Container = running instance of an image." },
    { q: "What is a multi-stage Docker build and why use it?", category: "Technical", tip: "Separate build and runtime stages to keep the final image small and secure." },
  ],
  "kubernetes": [
    { q: "What is the difference between a Deployment and a StatefulSet in Kubernetes?", category: "Technical", tip: "Deployments are for stateless apps. StatefulSets are for stateful apps needing stable network IDs and persistent storage." },
    { q: "How does Kubernetes handle service discovery?", category: "Technical", tip: "Via DNS — each Service gets a DNS name. Pods communicate using service names, not IPs." },
  ],
  "aws": [
    { q: "What is the difference between EC2 and Lambda?", category: "Technical", tip: "EC2 = persistent virtual machine you manage. Lambda = serverless, runs on demand, billed per execution." },
    { q: "Explain the difference between S3 and EBS.", category: "Technical", tip: "S3 = object storage, accessible over HTTP, highly durable. EBS = block storage attached to EC2, like a hard drive." },
  ],
  "machine learning": [
    { q: "What is the difference between precision and recall?", category: "Technical", tip: "Precision = of predicted positives, how many are correct. Recall = of actual positives, how many did you catch." },
    { q: "Explain cross-validation and why it matters.", category: "Technical", tip: "Splits data into k folds to evaluate model generalization. Prevents overfitting to a single train/test split." },
  ],
  "system design": [
    { q: "How would you design a URL shortener like bit.ly?", category: "Technical", tip: "Cover: hashing strategy, DB schema, caching with Redis, handling redirects, scaling reads." },
    { q: "What is the difference between horizontal and vertical scaling?", category: "Technical", tip: "Vertical = bigger machine. Horizontal = more machines. Horizontal is preferred for high availability." },
  ],
  "git": [
    { q: "What is the difference between git merge and git rebase?", category: "Technical", tip: "Merge preserves history with a merge commit. Rebase rewrites history for a cleaner linear log." },
  ],
  "css": [
    { q: "What is the CSS box model?", category: "Technical", tip: "Content → Padding → Border → Margin. box-sizing: border-box includes padding and border in the element's width." },
  ],
  "node": [
    { q: "How does Node.js handle asynchronous operations?", category: "Technical", tip: "Event loop + non-blocking I/O. Callbacks, Promises, and async/await are the patterns used." },
  ],
  "rest apis": [
    { q: "What HTTP status codes should a well-designed REST API use?", category: "Technical", tip: "200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error." },
  ],
  "tensorflow": [
    { q: "What is the difference between TensorFlow and Keras?", category: "Technical", tip: "Keras is a high-level API that runs on top of TensorFlow. TensorFlow gives lower-level control." },
  ],
  "pytorch": [
    { q: "What is the difference between PyTorch's dynamic and TensorFlow's static computation graphs?", category: "Technical", tip: "PyTorch builds the graph at runtime (dynamic), making debugging easier. TF 1.x was static; TF 2.x is also dynamic." },
  ],
  "linux": [
    { q: "What is the difference between a process and a thread in Linux?", category: "Technical", tip: "Processes have separate memory spaces. Threads share memory within a process. Threads are lighter but need synchronization." },
  ],
  "terraform": [
    { q: "What is Terraform state and why is it important?", category: "Technical", tip: "State tracks real-world resources. Remote state (S3 + DynamoDB) enables team collaboration and locking." },
  ],
};

function getQuestionsForRole(targetRole, userSkills = []) {
  const role = (targetRole || "").toLowerCase();
  const skillNames = userSkills.map(s => (s.name || s).toLowerCase());

  // Collect skill-specific questions based on user's actual skills
  const skillQuestions = [];
  for (const [key, qs] of Object.entries(SKILL_QUESTIONS)) {
    if (skillNames.some(s => s.includes(key) || key.includes(s))) {
      skillQuestions.push(...qs);
    }
  }

  const behavioral = [
    { q: "Tell me about yourself.", category: "Behavioral", tip: "Use the Present-Past-Future formula: current role → how you got here → where you're headed." },
    { q: "Why do you want to transition to this role?", category: "Behavioral", tip: "Be specific about what excites you about the role and connect it to your skills." },
    { q: "Describe a time you faced a difficult technical challenge. How did you solve it?", category: "Behavioral", tip: "Use STAR: Situation, Task, Action, Result. Quantify the result if possible." },
    { q: "How do you handle tight deadlines and competing priorities?", category: "Behavioral", tip: "Show that you prioritize, communicate, and deliver. Give a real example." },
    { q: "Tell me about a time you failed. What did you learn?", category: "Behavioral", tip: "Be honest, show self-awareness, and focus on what you changed afterward." },
  ];

  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter(q => { if (seen.has(q.q)) return false; seen.add(q.q); return true; });
  };

  if (role.includes("data scientist") || role.includes("ml") || role.includes("machine learning")) {
    const base = [
      { q: "Explain the difference between supervised and unsupervised learning.", category: "Technical", tip: "Give examples: supervised = classification/regression, unsupervised = clustering/PCA." },
      { q: "What is overfitting and how do you prevent it?", category: "Technical", tip: "Mention regularization (L1/L2), dropout, cross-validation, more data." },
      { q: "Walk me through how you would build a churn prediction model.", category: "Technical", tip: "Cover: data collection → EDA → feature engineering → model selection → evaluation → deployment." },
      { q: "What is the bias-variance tradeoff?", category: "Technical", tip: "High bias = underfitting, high variance = overfitting. The goal is to find the sweet spot." },
      { q: "How do you handle imbalanced datasets?", category: "Technical", tip: "SMOTE, class weights, undersampling, precision-recall over accuracy." },
      { q: "Explain how gradient descent works.", category: "Technical", tip: "Iteratively update weights in the direction that minimizes the loss function." },
    ];
    return { technical: dedupe([...base, ...skillQuestions]), behavioral };
  }

  if (role.includes("frontend") || role.includes("react")) {
    const base = [
      { q: "What is the virtual DOM and how does React use it?", category: "Technical", tip: "React keeps a virtual copy of the DOM and only updates what changed — this is reconciliation." },
      { q: "Explain the difference between useState and useEffect.", category: "Technical", tip: "useState manages state, useEffect handles side effects (API calls, subscriptions, timers)." },
      { q: "What is the difference between controlled and uncontrolled components?", category: "Technical", tip: "Controlled = React controls the value via state. Uncontrolled = DOM handles it via refs." },
      { q: "How does CSS specificity work?", category: "Technical", tip: "Inline > ID > Class > Element. Higher specificity wins. !important overrides all." },
      { q: "What is lazy loading and how do you implement it in React?", category: "Technical", tip: "React.lazy() + Suspense. Splits code into chunks loaded only when needed." },
      { q: "Explain the concept of lifting state up.", category: "Technical", tip: "Move shared state to the closest common ancestor so multiple children can access it." },
    ];
    return { technical: dedupe([...base, ...skillQuestions]), behavioral };
  }

  if (role.includes("backend") || role.includes("python") || role.includes("api")) {
    const base = [
      { q: "What is REST and what are its key principles?", category: "Technical", tip: "Stateless, client-server, uniform interface, cacheable, layered system." },
      { q: "Explain the difference between SQL and NoSQL databases.", category: "Technical", tip: "SQL = structured, relational, ACID. NoSQL = flexible schema, horizontal scaling, eventual consistency." },
      { q: "What is database indexing and when should you use it?", category: "Technical", tip: "Indexes speed up reads but slow down writes. Use on frequently queried columns." },
      { q: "How do you handle authentication in a REST API?", category: "Technical", tip: "JWT tokens: user logs in → server returns token → client sends token in Authorization header." },
      { q: "What is the N+1 query problem and how do you fix it?", category: "Technical", tip: "Fetching related data in a loop causes N+1 queries. Fix with eager loading / JOIN queries." },
      { q: "Explain what a race condition is and how to prevent it.", category: "Technical", tip: "Two processes accessing shared data simultaneously. Fix with locks, transactions, or atomic operations." },
    ];
    return { technical: dedupe([...base, ...skillQuestions]), behavioral };
  }

  if (role.includes("devops") || role.includes("cloud") || role.includes("sre")) {
    const base = [
      { q: "What is the difference between Docker and a virtual machine?", category: "Technical", tip: "Docker shares the host OS kernel (lightweight). VMs have their own OS (heavier, more isolated)." },
      { q: "Explain CI/CD and why it matters.", category: "Technical", tip: "CI = automatically test on every commit. CD = automatically deploy after tests pass. Reduces manual errors." },
      { q: "What is Kubernetes and what problem does it solve?", category: "Technical", tip: "Orchestrates containers at scale — handles deployment, scaling, self-healing, load balancing." },
      { q: "How would you debug a production outage?", category: "Technical", tip: "Check logs → metrics → recent deployments → rollback if needed → post-mortem." },
      { q: "What is Infrastructure as Code and why use it?", category: "Technical", tip: "Define infra in code (Terraform, CloudFormation) — version controlled, repeatable, auditable." },
      { q: "Explain the CAP theorem.", category: "Technical", tip: "Consistency, Availability, Partition tolerance — distributed systems can only guarantee 2 of 3." },
    ];
    return { technical: dedupe([...base, ...skillQuestions]), behavioral };
  }

  // Default / full stack
  const base = [
    { q: "Explain the difference between HTTP and HTTPS.", category: "Technical", tip: "HTTPS = HTTP + TLS encryption. Protects data in transit from eavesdropping." },
    { q: "What happens when you type a URL in the browser and press Enter?", category: "Technical", tip: "DNS lookup → TCP connection → HTTP request → server response → browser renders HTML." },
    { q: "What is the difference between authentication and authorization?", category: "Technical", tip: "Auth = who are you? Authorization = what are you allowed to do?" },
    { q: "Explain what a RESTful API is.", category: "Technical", tip: "Stateless HTTP API using standard methods: GET, POST, PUT, DELETE with resource-based URLs." },
    { q: "What is version control and why is Git important?", category: "Technical", tip: "Tracks changes, enables collaboration, allows rollback. Git is the industry standard." },
    { q: "What is the difference between a stack and a queue?", category: "Technical", tip: "Stack = LIFO (last in, first out). Queue = FIFO (first in, first out)." },
  ];
  return { technical: dedupe([...base, ...skillQuestions]), behavioral };
}

function InterviewPrep() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("User");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [userSkills, setUserSkills] = useState([]);
  const [questions, setQuestions] = useState({ technical: [], behavioral: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("technical");
  const [expanded, setExpanded] = useState({});
  const [answered, setAnswered] = useState({});
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    const saved = localStorage.getItem("upnext_interview_answered");
    if (saved) setAnswered(JSON.parse(saved));
    fetch(`http://127.0.0.1:8000/dashboard-data?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        const skills = d.skill_gap?.skills || [];
        setUserName(d.user_name || "User");
        setTargetRole(d.target_role || "Software Engineer");
        setUserSkills(skills);
        setQuestions(getQuestionsForRole(d.target_role, skills));
        setLoading(false);
      })
      .catch(() => { setQuestions(getQuestionsForRole("full stack", [])); setLoading(false); });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const markAnswered = (id) => {
    const updated = { ...answered, [id]: !answered[id] };
    setAnswered(updated);
    localStorage.setItem("upnext_interview_answered", JSON.stringify(updated));
  };

  const allQ = [...(questions.technical || []), ...(questions.behavioral || [])];
  const answeredCount = allQ.filter((_, i) => answered[i]).length;

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview", active: true },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  const activeQuestions = activeTab === "technical" ? questions.technical : questions.behavioral;
  const offset = activeTab === "behavioral" ? (questions.technical || []).length : 0;

  return (
    <div className={`ip_wrapper${darkMode ? " dark" : ""}`}>
      <aside className={`ip_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="ip_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="ip_logo">
          <div className="ip_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>
        <nav className="ip_nav">
          {navItems.map(item => (
            <div key={item.label} className={`ip_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}>
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="ip_sidebar_foot">
          <div className="ip_nav_item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="ip_nav_item ip_logout" onClick={handleLogout}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="ip_user_row">
              <div className="ip_avatar_sm">{getInitials(userName)}</div>
              <div>
                <p className="ip_user_name_text">{userName}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      <main className={`ip_main${collapsed ? " collapsed" : ""}`}>
        <header className="ip_header">
          <h2 className="ip_page_title">Interview Prep</h2>
          <div className="ip_search_box">
            <FaSearch /><input type="text" placeholder="Search..." />
          </div>
          <div className="ip_header_right">
            <div className="ip_icon_btn"><FaBell /></div>
            <div className="ip_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="ip_avatar_sm purple">{getInitials(userName)}</div>
          </div>
        </header>

        <div className="ip_content">
          <div className="ip_intro">
            <div>
              <h1>Interview Prep</h1>
              <p className="ip_intro_sub">Questions tailored for <strong>{targetRole}</strong> interviews</p>
            </div>
            <div className="ip_progress_chip">
              <FaCheck /> {answeredCount}/{allQ.length} practiced
            </div>
          </div>

          {/* Progress */}
          <div className="ip_card ip_prog_card">
            <div className="ip_prog_row">
              <span>Practice Progress</span>
              <span>{allQ.length ? Math.round((answeredCount / allQ.length) * 100) : 0}%</span>
            </div>
            <div className="ip_prog_track">
              <div className="ip_prog_fill" style={{ width: allQ.length ? `${(answeredCount / allQ.length) * 100}%` : "0%" }} />
            </div>
          </div>

          {/* Practice mode */}
          {!practiceMode ? (
            <div className="ip_card ip_practice_banner">
              <div>
                <h3>🎯 Practice Mode</h3>
                <p>Go through questions one by one, like a real interview. See tips after each answer.</p>
              </div>
              <button className="ip_practice_btn" onClick={() => { setPracticeMode(true); setCurrentQ(0); setShowTip(false); }}>
                Start Practice
              </button>
            </div>
          ) : (
            <div className="ip_card ip_practice_card">
              <div className="ip_practice_header">
                <span className="ip_practice_label">Practice Mode — Question {currentQ + 1} of {allQ.length}</span>
                <button className="ip_exit_btn" onClick={() => setPracticeMode(false)}>Exit</button>
              </div>
              <div className="ip_practice_q">{allQ[currentQ]?.q}</div>
              <span className="ip_practice_cat">{allQ[currentQ]?.category}</span>
              {showTip && (
                <div className="ip_tip_box">
                  <strong>💡 Tip:</strong> {allQ[currentQ]?.tip}
                </div>
              )}
              <div className="ip_practice_actions">
                <button className="ip_tip_btn" onClick={() => setShowTip(!showTip)}>
                  {showTip ? "Hide Tip" : "Show Tip"}
                </button>
                <button className="ip_next_btn" onClick={() => {
                  if (currentQ < allQ.length - 1) { setCurrentQ(c => c + 1); setShowTip(false); }
                  else { setPracticeMode(false); }
                }}>
                  {currentQ < allQ.length - 1 ? "Next Question →" : "Finish"}
                </button>
              </div>
              <div className="ip_practice_prog">
                <div className="ip_practice_fill" style={{ width: `${((currentQ + 1) / allQ.length) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Tabs */}
          {loading ? (
            <div className="ip_loading">
              <div className="ip_spinner" />
              <p>Loading your personalized questions...</p>
            </div>
          ) : (
          <>
          {/* Tabs */}
          <div className="ip_tabs">
            <button className={`ip_tab${activeTab === "technical" ? " active" : ""}`} onClick={() => setActiveTab("technical")}>
              Technical ({(questions.technical || []).length})
            </button>
            <button className={`ip_tab${activeTab === "behavioral" ? " active" : ""}`} onClick={() => setActiveTab("behavioral")}>
              Behavioral ({(questions.behavioral || []).length})
            </button>
          </div>

          {/* Questions list */}
          <div className="ip_card">
            {(activeQuestions || []).map((item, i) => {
              const id = offset + i;
              const isOpen = expanded[id];
              const isDone = answered[id];
              return (
                <div key={id} className={`ip_question${isDone ? " done" : ""}`}>
                  <div className="ip_q_header" onClick={() => toggleExpand(id)}>
                    <div className="ip_q_left">
                      <span className="ip_q_num">{id + 1}</span>
                      <p className="ip_q_text">{item.q}</p>
                    </div>
                    <div className="ip_q_right">
                      <span className={`ip_cat_badge ip_cat_${item.category.toLowerCase()}`}>{item.category}</span>
                      <div className={`ip_done_btn${isDone ? " checked" : ""}`}
                        onClick={e => { e.stopPropagation(); markAnswered(id); }}>
                        {isDone && <FaCheck />}
                      </div>
                      {isOpen ? <FaChevronUp className="ip_chevron" /> : <FaChevronDown className="ip_chevron" />}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="ip_tip_reveal">
                      <strong>💡 How to answer:</strong>
                      <p>{item.tip}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reset */}
          <button className="ip_reset_btn" onClick={() => {
            setAnswered({});
            localStorage.removeItem("upnext_interview_answered");
          }}>
            <FaRedo /> Reset Progress
          </button>
          </>
          )}
        </div>
      </main>
    </div>
  );
}

export default InterviewPrep;
