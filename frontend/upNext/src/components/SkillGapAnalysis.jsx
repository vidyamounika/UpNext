import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight, FaSun, FaRobot
} from "react-icons/fa";
import axios from "axios";
import "../styles/SkillGapAnalysis.scss";

// ── Helper: 5-dot skill level indicator ─────────────────────────
function SkillDots({ level }) {
  const filled = Math.round((level / 100) * 5);
  return (
    <span className="sg_dots">
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} className={`sg_dot${i < filled ? " filled" : ""}`} />
      ))}
    </span>
  );
}

// ── Helper: initials from name ───────────────────────────────────
function getInitials(name) {
  return name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";
}

// ── Inline SVG Radar Chart ───────────────────────────────────────
function RadarChart({ axes }) {
  if (!axes || axes.length === 0) return null;

  const cx = 150, cy = 150, R = 110;
  const levels = 5;
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  // Helper: get x,y for axis i at radius r
  const pt = (i, r) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid lines (5 levels)
  const gridPolygons = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = (lvl / levels) * R;
    const points = Array.from({ length: n }, (_, i) => {
      const p = pt(i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
    gridPolygons.push(
      <polygon key={lvl} points={points} fill="none" stroke="#e0d4ff" strokeWidth="1" />
    );
  }

  // Axis lines
  const axisLines = Array.from({ length: n }, (_, i) => {
    const end = pt(i, R);
    return (
      <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
        stroke="#d4c5ff" strokeWidth="1" />
    );
  });

  // User data polygon (75% filled for user skills, 0 for missing)
  const dataPoints = axes.map((axis, i) => {
    const r = (axis.level / 100) * R;
    return pt(i, r);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  // Labels
  const labelOffset = 18;
  const labels = axes.map((axis, i) => {
    const p = pt(i, R + labelOffset);
    return (
      <text key={i} x={p.x} y={p.y}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fill="#6b7280" fontWeight="500">
        {axis.name.length > 12 ? axis.name.slice(0, 11) + "…" : axis.name}
      </text>
    );
  });

  return (
    <svg viewBox="0 0 300 300" className="sg_radar_svg">
      {gridPolygons}
      {axisLines}
      <polygon
        points={dataPolygon}
        fill="rgba(124,58,237,0.18)"
        stroke="#7c3aed"
        strokeWidth="2"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
          fill={axes[i].level > 0 ? "#7c3aed" : "#e0d4ff"}
          stroke="white" strokeWidth="1.5" />
      ))}
      {labels}
    </svg>
  );
}

// ── Priority color helpers ───────────────────────────────────────
const PRIORITY_DOT = {
  critical: "sg_dot_red",
  high: "sg_dot_orange",
  medium: "sg_dot_blue",
  low: "sg_dot_light",
};
const PRIORITY_BADGE_CLASS = {
  critical: "sg_badge_critical",
  high: "sg_badge_high",
  medium: "sg_badge_medium",
  low: "sg_badge_low",
};

// ── Main Component ───────────────────────────────────────────────
function SkillGapAnalysis() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    axios
      .get(`http://127.0.0.1:8000/skill-gap-data?email=${encodeURIComponent(email)}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap", active: true },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  if (loading) {
    return (
      <div className="sg_loading">
        <div className="sg_spinner" />
        <p>Analyzing your skill gaps...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sg_loading">
        <p>Failed to load data.{" "}
          <span onClick={() => navigate("/login")} style={{ color: "#7c3aed", cursor: "pointer" }}>
            Go back to login
          </span>
        </p>
      </div>
    );
  }

  const { user_name, target_role, current_skills, missing_skills, radar, matrix, ai_analysis } = data;

  return (
    <div className={`sg_wrapper${darkMode ? " dark" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className={`sg_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="sg_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="sg_logo">
          <div className="sg_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>

        <nav className="sg_nav">
          {navItems.map(item => (
            <div
              key={item.label}
              className={`sg_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}
            >
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="sg_sidebar_foot">
          <div className="sg_nav_item" onClick={() => setDarkMode(!darkMode)} title={collapsed ? "Dark Mode" : ""}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="sg_nav_item sg_logout" onClick={handleLogout} title={collapsed ? "Log Out" : ""}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="sg_user_row">
              <div className="sg_avatar_sm">{getInitials(user_name)}</div>
              <div>
                <p className="sg_user_name_text">{user_name}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={`sg_main${collapsed ? " collapsed" : ""}`}>
        {/* Header */}
        <header className="sg_header">
          <h2 className="sg_page_title">Skill Gap Analysis</h2>
          <div className="sg_search_box">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="sg_header_right">
            <div className="sg_icon_btn"><FaBell /></div>
            <div className="sg_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="sg_avatar_sm purple">{getInitials(user_name)}</div>
          </div>
        </header>

        {/* Content */}
        <div className="sg_content">
          {/* Page intro */}
          <div className="sg_intro">
            <h1>Skill Gap Analysis</h1>
            <p className="sg_intro_sub">AI-powered gap analysis for <strong>{target_role}</strong></p>
          </div>

          {/* Section 1 — Current Skills */}
          <div className="sg_card">
            <h3 className="sg_section_title">Your Current Skills</h3>
            <div className="sg_skills_grid">
              {current_skills.map(skill => (
                <div key={skill.name} className="sg_skill_pill">
                  <span className="sg_skill_name">{skill.name}</span>
                  <SkillDots level={skill.level} />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 — Missing Skills */}
          <div className="sg_card">
            <h3 className="sg_section_title">Missing Skills for Target Role</h3>
            {missing_skills.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Great job! You already have all the skills required for {target_role}.
              </p>
            ) : (
              missing_skills.map(skill => (
                <div key={skill.name} className="sg_missing_row">
                  <span className={`sg_miss_dot ${PRIORITY_DOT[skill.priority] || "sg_dot_blue"}`} />
                  <span className="sg_miss_name">{skill.name}</span>
                  <span className="sg_miss_effort">Effort: {skill.effort}</span>
                  <span className={`sg_priority_badge ${PRIORITY_BADGE_CLASS[skill.priority]}`}>
                    {skill.priority.charAt(0).toUpperCase() + skill.priority.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Section 3 — Radar Chart */}
          <div className="sg_card">
            <h3 className="sg_section_title">Skill Strength Radar</h3>
            <div className="sg_radar_wrap">
              <RadarChart axes={radar} />
            </div>
          </div>

          {/* Section 4 — Priority vs Effort Matrix */}
          <div className="sg_card">
            <h3 className="sg_section_title">Priority vs Effort Matrix</h3>
            <div className="sg_matrix">
              {/* Quick Wins */}
              <div className="sg_quadrant sg_q_green">
                <p className="sg_q_title">Quick Wins</p>
                <p className="sg_q_sub">High priority · Low effort</p>
                {(matrix.quick_wins || []).map(name => (
                  <div key={name} className="sg_q_item">{name}</div>
                ))}
                {(matrix.quick_wins || []).length === 0 && (
                  <p className="sg_q_empty">None identified</p>
                )}
              </div>

              {/* Major Projects */}
              <div className="sg_quadrant sg_q_white">
                <p className="sg_q_title">Major Projects</p>
                <p className="sg_q_sub">High priority · High effort</p>
                {(matrix.major_projects || []).map(name => (
                  <div key={name} className="sg_q_item">{name}</div>
                ))}
                {(matrix.major_projects || []).length === 0 && (
                  <p className="sg_q_empty">None identified</p>
                )}
              </div>

              {/* Fill-Ins */}
              <div className="sg_quadrant sg_q_blue">
                <p className="sg_q_title">Fill-Ins</p>
                <p className="sg_q_sub">Low priority · Low effort</p>
                {(matrix.fill_ins || []).map(name => (
                  <div key={name} className="sg_q_item">{name}</div>
                ))}
                {(matrix.fill_ins || []).length === 0 && (
                  <p className="sg_q_empty">None identified</p>
                )}
              </div>

              {/* Hard Decisions */}
              <div className="sg_quadrant sg_q_yellow">
                <p className="sg_q_title">Hard Decisions</p>
                <p className="sg_q_sub">Low priority · High effort</p>
                {(matrix.hard_decisions || []).map(name => (
                  <div key={name} className="sg_q_item">{name}</div>
                ))}
                {(matrix.hard_decisions || []).length === 0 && (
                  <p className="sg_q_empty">None identified</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5 — AI Analysis */}
          <div className="sg_card sg_ai_card">
            <div className="sg_ai_head">
              <div className="sg_ai_icon"><FaRobot /></div>
              <div>
                <h3>AI Analysis — {user_name}'s Roadmap to {target_role}</h3>
                <p className="sg_ai_sub">{ai_analysis?.intro}</p>
              </div>
            </div>
            <div className="sg_priorities">
              {(ai_analysis?.priorities || []).map(p => (
                <div key={p.number} className="sg_priority_card">
                  <div className="sg_priority_num">{p.number}</div>
                  <div>
                    <p className="sg_priority_title">{p.title}</p>
                    <p className="sg_priority_desc">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default SkillGapAnalysis;
