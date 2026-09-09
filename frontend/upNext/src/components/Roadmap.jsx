import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight,
  FaSun, FaCheck, FaSync
} from "react-icons/fa";
import axios from "axios";
import API_BASE from "../api";
import "../styles/Roadmap.scss";

function getInitials(name) {
  return name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";
}

function Roadmap() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [taskDone, setTaskDone] = useState({});
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = async (email) => {
    try {
      const res = await axios.get(`${API_BASE}/roadmap-data?email=${encodeURIComponent(email)}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveProgressToDB = (email, tasks, totalCount) => {
    axios.post(`${API_BASE}/roadmap-progress`, {
      email,
      tasks,
      total_tasks: totalCount,
    }).catch(err => console.error("Progress sync failed:", err));
  };

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }

    Promise.all([
      axios.get(`${API_BASE}/roadmap-data?email=${encodeURIComponent(email)}`),
      axios.get(`${API_BASE}/roadmap-progress?email=${encodeURIComponent(email)}`),
    ])
      .then(([roadmapRes, progressRes]) => {
        setData(roadmapRes.data);
        const tasks = progressRes.data.tasks || {};
        setTaskDone(tasks);
        localStorage.setItem("upnext_roadmap_tasks", JSON.stringify(tasks));
        if (progressRes.data.total_tasks > 0) {
          localStorage.setItem("upnext_roadmap_total", progressRes.data.total_tasks.toString());
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const toggleTask = (weekIdx, taskIdx) => {
    const email = localStorage.getItem("upnext_email");
    const key = `w${weekIdx}t${taskIdx}`;
    const updated = { ...taskDone, [key]: !taskDone[key] };
    setTaskDone(updated);
    localStorage.setItem("upnext_roadmap_tasks", JSON.stringify(updated));
    const total = data ? (data.weeks || []).flatMap(w => w.tasks || []).length : 0;
    saveProgressToDB(email, updated, total);
  };

  const handleRegenerate = async () => {
    const email = localStorage.getItem("upnext_email");
    if (!email) return;
    setRegenerating(true);
    setTaskDone({});
    localStorage.removeItem("upnext_roadmap_tasks");
    localStorage.removeItem("upnext_roadmap_total");
    saveProgressToDB(email, {}, 0);
    await fetchData(email);
    setRegenerating(false);
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap", active: true },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  if (loading) {
    return (
      <div className="rm_loading">
        <div className="rm_spinner" />
        <p>Building your personalized roadmap...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rm_loading">
        <p>
          Failed to load roadmap.{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#7c3aed", cursor: "pointer" }}
          >
            Go back to login
          </span>
        </p>
      </div>
    );
  }

  const { target_role, num_months, hours_per_week, phases, weeks } = data;

  // Overall progress calculation
  const allTasks = (weeks || []).flatMap((w, wi) =>
    (w.tasks || []).map((t, ti) => `w${wi}t${ti}`)
  );
  // Keep Dashboard in sync — it reads this to compute the same progress %
  if (allTasks.length > 0) {
    localStorage.setItem("upnext_roadmap_total", allTasks.length.toString());
  }
  const doneTasks = allTasks.filter(id => taskDone[id]);
  const progressPct = allTasks.length
    ? Math.round((doneTasks.length / allTasks.length) * 100)
    : 0;
  const monthsRemaining = Math.ceil(
    (allTasks.length - doneTasks.length) / (3 * 4)
  );

  // Which months are "complete"
  // A month is complete if all weeks that belong to it are fully done.
  // Each phase covers ~(total_weeks / num_months) weeks.
  const weeksPerMonth = weeks.length > 0 ? Math.ceil(weeks.length / num_months) : 4;
  const isMonthComplete = (monthIdx) => {
    const startWeek = monthIdx * weeksPerMonth;
    const endWeek = Math.min(startWeek + weeksPerMonth, weeks.length);
    if (startWeek >= weeks.length) return false;
    for (let wi = startWeek; wi < endWeek; wi++) {
      const w = weeks[wi];
      if (!w) return false;
      for (let ti = 0; ti < (w.tasks || []).length; ti++) {
        if (!taskDone[`w${wi}t${ti}`]) return false;
      }
    }
    return true;
  };

  return (
    <div className={`rm_wrapper${darkMode ? " dark" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className={`rm_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="rm_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="rm_logo">
          <div className="rm_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>

        <nav className="rm_nav">
          {navItems.map(item => (
            <div
              key={item.label}
              className={`rm_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}
            >
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="rm_sidebar_foot">
          <div
            className="rm_nav_item"
            onClick={() => setDarkMode(!darkMode)}
            title={collapsed ? "Dark Mode" : ""}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div
            className="rm_nav_item rm_logout"
            onClick={handleLogout}
            title={collapsed ? "Log Out" : ""}
          >
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="rm_user_row">
              <div className="rm_avatar_sm">{getInitials(data.user_name)}</div>
              <div>
                <p className="rm_user_name_text">{data.user_name}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={`rm_main${collapsed ? " collapsed" : ""}`}>
        {/* Header */}
        <header className="rm_header">
          <h2 className="rm_page_title">Roadmap</h2>
          <div className="rm_search_box">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="rm_header_right">
            <div className="rm_icon_btn"><FaBell /></div>
            <div className="rm_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="rm_avatar_sm purple">{getInitials(data.user_name)}</div>
          </div>
        </header>

        {/* Content */}
        <div className="rm_content">

          {/* Page Intro */}
          <div className="rm_page_intro">
            <div className="rm_intro_left">
              <h1>Your Learning Roadmap</h1>
              <p className="rm_intro_sub">
                {target_role} path · {num_months}-month plan · {hours_per_week} hrs/week
              </p>
            </div>
            <button
              className={`rm_regen_btn${regenerating ? " spinning" : ""}`}
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <FaSync />
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>

          {/* Overall Progress Card */}
          <div className="rm_card">
            <div className="rm_progress_row">
              <span className="rm_progress_label">Overall Progress</span>
              <span className="rm_progress_pct">{progressPct}%</span>
            </div>
            <div className="rm_progress_bar">
              <div
                className="rm_progress_fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="rm_progress_meta">
              <span>{doneTasks.length} / {allTasks.length} tasks complete</span>
              <span>~{Math.max(monthsRemaining, 0)} months remaining</span>
            </div>
          </div>

          {/* Monthly Milestones */}
          <div className="rm_card">
            <h3 className="rm_section_title">Monthly Milestones</h3>
            <div className="rm_timeline">
              {(phases || []).map((phase, idx) => {
                const complete = isMonthComplete(idx);
                return (
                  <div key={phase.month} className="rm_milestone">
                    <div className={`rm_milestone_circle${complete ? " complete" : ""}`}>
                      {complete ? <FaCheck /> : phase.month}
                    </div>
                    <div className="rm_milestone_content">
                      <div className="rm_milestone_month">
                        Month {phase.month}
                        {complete && (
                          <span className="rm_complete_badge">Complete</span>
                        )}
                      </div>
                      <div className="rm_milestone_name">{phase.name}</div>
                      <div className="rm_milestone_desc">
                        {getMilestoneDesc(phase.name, idx)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Learning Tasks */}
          <div className="rm_card">
            <h3 className="rm_section_title">Weekly Learning Tasks</h3>
            {(weeks || []).map((week, wi) => {
              const doneCount = (week.tasks || []).filter(
                (_, ti) => taskDone[`w${wi}t${ti}`]
              ).length;
              const total = (week.tasks || []).length;
              return (
                <div key={week.week} className="rm_week_card">
                  <div className="rm_week_header">
                    <span className="rm_week_label">Week {week.week}</span>
                    <span className="rm_week_done">{doneCount}/{total} done</span>
                  </div>
                  <div className="rm_week_theme">{week.theme}</div>
                  <div className="rm_week_bar">
                    <div
                      className="rm_week_fill"
                      style={{ width: total ? `${(doneCount / total) * 100}%` : "0%" }}
                    />
                  </div>
                  {(week.tasks || []).map((task, ti) => {
                    const done = !!taskDone[`w${wi}t${ti}`];
                    return (
                      <div key={ti} className="rm_task">
                        <div
                          className={`rm_checkbox${done ? " checked" : ""}`}
                          onClick={() => toggleTask(wi, ti)}
                        >
                          {done && <FaCheck />}
                        </div>
                        <span className={`rm_task_text${done ? " done" : ""}`}>
                          {task.task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

// Helper: short description per phase
function getMilestoneDesc(phaseName, idx) {
  const descs = [
    "Set the foundation — understand core concepts and establish study habits.",
    "Go deeper — build practical skills through hands-on exercises and projects.",
    "Apply your knowledge — work on real-world projects and prepare for interviews.",
    "Land the role — polish your portfolio, network, and start applying.",
    "Specialize further — deepen expertise in your chosen domain.",
    "Lead and grow — take on leadership opportunities and mentor others.",
    "Reach mastery — tackle complex problems and contribute to open source.",
    "Achieve excellence — become a recognized expert in your field.",
    "Advanced practice — continuously refine skills with advanced challenges.",
    "Senior track — build systems, influence architecture, drive impact.",
    "Expert level — shape technical direction and thought leadership.",
    "Career summit — own your career path and inspire others.",
  ];
  return descs[idx] || `Build on your progress and advance toward ${phaseName}.`;
}

export default Roadmap;
