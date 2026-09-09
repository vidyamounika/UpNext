import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight,
  FaSun, FaUpload, FaCheck, FaExclamationTriangle, FaTimesCircle, FaRobot
} from "react-icons/fa";
import "../styles/ResumeAnalyzer.scss";

function getInitials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
}

// Simulates resume analysis based on user's target role and skills
function analyzeResume(fileName, targetRole, userSkills) {
  const score = Math.floor(Math.random() * 20) + 65; // 65–85
  const missing = ["Quantified achievements", "Action verbs", "ATS keywords for " + targetRole];
  const good = ["Clear contact info", "Education section present", "Skills section included"];
  const suggestions = [
    { type: "error", text: `Add more keywords related to "${targetRole}" — recruiters use ATS filters.` },
    { type: "warning", text: "Quantify your achievements (e.g., 'Improved performance by 40%' instead of 'Improved performance')." },
    { type: "warning", text: "Use strong action verbs: Built, Designed, Led, Optimized, Delivered." },
    { type: "success", text: "Your skills section is well-structured and easy to scan." },
    { type: "success", text: "Contact information is clearly visible at the top." },
    { type: "error", text: "Add a professional summary tailored to " + targetRole + " roles." },
  ];
  const keywords = (userSkills || []).slice(0, 5).map(s => ({ word: s, found: Math.random() > 0.4 }));
  return { score, missing, good, suggestions, keywords };
}

function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("User");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [userSkills, setUserSkills] = useState([]);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    fetch(`http://127.0.0.1:8000/dashboard-data?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        setUserName(d.user_name || "User");
        setTargetRole(d.target_role || "Software Engineer");
        setUserSkills((d.skill_gap?.skills || []).map(s => s.name));
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setAnalysis(null);
  };

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(analyzeResume(file.name, targetRole, userSkills));
      setAnalyzing(false);
    }, 2000);
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume", active: true },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  const SCORE_COLOR = analysis
    ? analysis.score >= 80 ? "#10b981" : analysis.score >= 65 ? "#f59e0b" : "#ef4444"
    : "#7c3aed";

  return (
    <div className={`ra_wrapper${darkMode ? " dark" : ""}`}>
      <aside className={`ra_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="ra_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="ra_logo">
          <div className="ra_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>
        <nav className="ra_nav">
          {navItems.map(item => (
            <div key={item.label} className={`ra_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}>
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="ra_sidebar_foot">
          <div className="ra_nav_item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="ra_nav_item ra_logout" onClick={handleLogout}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="ra_user_row">
              <div className="ra_avatar_sm">{getInitials(userName)}</div>
              <div>
                <p className="ra_user_name_text">{userName}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      <main className={`ra_main${collapsed ? " collapsed" : ""}`}>
        <header className="ra_header">
          <h2 className="ra_page_title">Resume Analyzer</h2>
          <div className="ra_search_box">
            <FaSearch /><input type="text" placeholder="Search..." />
          </div>
          <div className="ra_header_right">
            <div className="ra_icon_btn"><FaBell /></div>
            <div className="ra_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="ra_avatar_sm purple">{getInitials(userName)}</div>
          </div>
        </header>

        <div className="ra_content">
          <div className="ra_intro">
            <h1>Resume Analyzer</h1>
            <p className="ra_intro_sub">Get AI-powered feedback tailored for <strong>{targetRole}</strong> roles</p>
          </div>

          {/* Upload zone */}
          <div className="ra_card">
            <h3 className="ra_section_title">Upload Your Resume</h3>
            <div
              className={`ra_dropzone${dragging ? " dragging" : ""}${file ? " has_file" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("ra_file_input").click()}
            >
              <input id="ra_file_input" type="file" accept=".pdf,.doc,.docx"
                style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div className="ra_file_info">
                  <FaFileAlt className="ra_file_icon" />
                  <div>
                    <p className="ra_file_name">{file.name}</p>
                    <p className="ra_file_size">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="ra_upload_hint">
                  <FaUpload className="ra_upload_icon" />
                  <p>Drag & drop your resume here</p>
                  <span>PDF, DOC, DOCX · Max 5MB</span>
                </div>
              )}
            </div>

            <button className="ra_analyze_btn" onClick={handleAnalyze} disabled={!file || analyzing}>
              {analyzing ? <><div className="ra_btn_spinner" /> Analyzing...</> : <><FaRobot /> Analyze Resume</>}
            </button>
          </div>

          {/* Results */}
          {analysis && (
            <>
              {/* Score */}
              <div className="ra_card ra_score_card">
                <div className="ra_score_left">
                  <h3>Resume Score</h3>
                  <p className="ra_score_sub">vs. {targetRole} job requirements</p>
                  <div className="ra_score_bar_wrap">
                    <div className="ra_score_track">
                      <div className="ra_score_fill" style={{ width: `${analysis.score}%`, background: SCORE_COLOR }} />
                    </div>
                    <span className="ra_score_pct" style={{ color: SCORE_COLOR }}>{analysis.score}%</span>
                  </div>
                  <p className="ra_score_label" style={{ color: SCORE_COLOR }}>
                    {analysis.score >= 80 ? "Strong Resume" : analysis.score >= 65 ? "Needs Improvement" : "Weak — Needs Major Work"}
                  </p>
                </div>
                <div className="ra_score_ring_wrap">
                  <svg viewBox="0 0 100 100" className="ra_score_ring">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={SCORE_COLOR} strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(analysis.score / 100) * 251.2} 251.2`}
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <span className="ra_ring_num" style={{ color: SCORE_COLOR }}>{analysis.score}</span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="ra_card">
                <h3 className="ra_section_title">Improvement Suggestions</h3>
                <div className="ra_suggestions">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className={`ra_suggestion ra_sug_${s.type}`}>
                      {s.type === "error" && <FaTimesCircle className="ra_sug_icon" />}
                      {s.type === "warning" && <FaExclamationTriangle className="ra_sug_icon" />}
                      {s.type === "success" && <FaCheck className="ra_sug_icon" />}
                      <p>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword match */}
              <div className="ra_card">
                <h3 className="ra_section_title">Keyword Match for {targetRole}</h3>
                <p className="ra_keyword_hint">These are key skills recruiters look for. Make sure they appear in your resume.</p>
                <div className="ra_keywords">
                  {analysis.keywords.map((k, i) => (
                    <div key={i} className={`ra_keyword${k.found ? " found" : " missing"}`}>
                      {k.found ? <FaCheck /> : <FaTimesCircle />}
                      <span>{k.word}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="ra_card ra_tips_card">
                <div className="ra_ai_head">
                  <div className="ra_ai_icon"><FaRobot /></div>
                  <div>
                    <h3>Quick Tips for {targetRole} Resumes</h3>
                    <p className="ra_ai_sub">Based on top-performing resumes in your target role</p>
                  </div>
                </div>
                <ul className="ra_tips_list">
                  <li>Keep your resume to 1 page if you have under 5 years of experience.</li>
                  <li>Tailor your summary to mention "{targetRole}" explicitly — ATS systems scan for it.</li>
                  <li>List your most relevant projects with GitHub links and measurable outcomes.</li>
                  <li>Use the same keywords from the job description in your resume.</li>
                  <li>Avoid tables, columns, and graphics — they break ATS parsers.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResumeAnalyzer;
