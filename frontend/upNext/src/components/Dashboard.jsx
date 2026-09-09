import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaTrophy, FaFire, FaStar,
  FaCode, FaCheck, FaThLarge, FaGlobeAmericas,
  FaChevronLeft, FaChevronRight, FaSun, FaExclamationTriangle
} from "react-icons/fa";
import { MdShield } from "react-icons/md";
import axios from "axios";
import "../styles/Dashboard.scss";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    axios.get(`http://127.0.0.1:8000/dashboard-data?email=${encodeURIComponent(email)}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="db_loading">
        <div className="db_spinner" />
        <p>Building your personalized dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="db_loading">
        <p>Failed to load dashboard. <span onClick={() => navigate("/login")} style={{color:"#7c3aed",cursor:"pointer"}}>Go back to login</span></p>
      </div>
    );
  }

  const CIRCUMFERENCE = 2 * Math.PI * 40;

  const badgeIcons = {
    Streak: <FaFire />, Builder: <FaCode />, "Top 10%": <FaStar />,
    Certified: <MdShield />, Interview: <FaMicrophone />, Staff: <FaTrophy />
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard", active: true },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  return (
    <div className={`db_wrapper ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className={`db_sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="db_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="db_logo">
          <div className="db_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>

        <nav className="db_nav">
          {navItems.map(item => (
            <div key={item.label}
              className={`db_nav_item ${item.active ? "active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}>
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="db_sidebar_foot">
          <div className="db_nav_item" onClick={() => setDarkMode(!darkMode)} title={collapsed ? "Dark Mode" : ""}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="db_nav_item db_logout" onClick={handleLogout} title={collapsed ? "Log Out" : ""}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="db_user_row">
              <div className="db_avatar_sm">{getInitials(data.user_name)}</div>
              <div>
                <p className="db_user_name_text">{data.user_name}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className={`db_main ${collapsed ? "collapsed" : ""}`}>
        <header className="db_header">
          <h2 className="db_page_title">Dashboard</h2>
          <div className="db_search_box">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="db_header_right">
            <div className="db_icon_btn"><FaBell /></div>
            <div className="db_icon_btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <FaSun /> : <FaMoon />}</div>
            <div className="db_avatar_sm purple">{getInitials(data.user_name)}</div>
          </div>
        </header>

        <div className="db_content">

          {/* Hero Banner */}
          <div className="db_hero">
            <div className="db_hero_left">
              <p className="db_streak_tag"><FaFire /> {data.streak_days}-day streak active</p>
              <h1>{getGreeting()}, {data.user_name}!</h1>
              <p className="db_hero_sub">
                You're {data.readiness_gap} pts from your {data.target_role} target. Here's your snapshot.
              </p>
            </div>
            <div className="db_hero_right">
              <p className="db_readiness_lbl">Overall readiness</p>
              <div className="db_readiness_group">
                <div className="db_ring_wrap">
                  <svg viewBox="0 0 100 100" className="db_ring_svg">
                    <circle cx="50" cy="50" r="40" className="ring_bg" />
                    <circle
                      cx="50" cy="50" r="40" className="ring_fg"
                      strokeDasharray={`${(data.overall_readiness / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <span className="db_ring_num">{data.overall_readiness}</span>
                </div>
                <span className="db_readiness_score">{data.overall_readiness}/100</span>
              </div>
            </div>
          </div>

          {/* Skill Gap */}
          <div className="db_card">
            <div className="db_card_head">
              <div className="db_card_icon bg_purple"><FaBrain /></div>
              <div>
                <h3>AI Skill Gap Analysis</h3>
                <p>vs. {data.target_role} benchmark</p>
              </div>
            </div>

            <div className="db_journey_labels">
              <span className="db_journey_from">{data.current_role}</span>
              <span className="db_journey_score">{data.overall_readiness}% ready</span>
              <span className="db_journey_to">{data.target_role}</span>
            </div>
            <div className="db_journey_bar">
              <div className="db_journey_fill" style={{ width: `${data.overall_readiness}%` }} />
            </div>

            <div className="db_gap_footer">
              <span className="db_gap_count">
                <FaExclamationTriangle />
                {data.skill_gap.skills.filter(s => s.required - s.user_level > 15).length} critical gaps identified
              </span>
              <span className="db_link purple_text" onClick={() => navigate("/skill-gap")} style={{ cursor: "pointer" }}>
                View full report →
              </span>
            </div>
          </div>

          {/* Roadmap */}
          {(() => {
            const totalTasks = data.roadmap.total_tasks > 0 ? data.roadmap.total_tasks : data.roadmap.total_weeks * 3;
            const doneTasks = data.roadmap.tasks_done || 0;
            const liveProgress = data.roadmap.progress_pct ?? (totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);
            const numPhases = (data.roadmap.phases || []).length || 1;
            return (
              <div className="db_card">
                <div className="db_card_head">
                  <div className="db_card_icon bg_blue"><FaMap /></div>
                  <div>
                    <h3>Personalized Roadmap</h3>
                    <p>Week {data.roadmap.current_week} of {data.roadmap.total_weeks} · {data.roadmap.plan_duration}</p>
                  </div>
                  <span className="db_link blue_text" onClick={() => navigate("/roadmap")} style={{ cursor: "pointer" }}>View plan ›</span>
                </div>

                <div className="db_prog_row">
                  <span>Overall progress</span>
                  <span>{liveProgress}%</span>
                </div>
                <div className="db_prog_track">
                  <div className="db_prog_fill" style={{ width: `${liveProgress}%` }} />
                </div>

                <div className="db_roadmap_phases_visual">
                  {(data.roadmap.phases || []).map((phase, i) => {
                    const phaseComplete = liveProgress >= Math.round(((i + 1) / numPhases) * 100);
                    const phaseCurrent = !phaseComplete && liveProgress >= Math.round((i / numPhases) * 100);
                    return (
                      <React.Fragment key={i}>
                        <div className={`db_rm_phase_step${phaseComplete ? " done" : ""}${phaseCurrent ? " current" : ""}`}>
                          <div className="db_rm_phase_circle">
                            {phaseComplete ? <FaCheck /> : <span>{i + 1}</span>}
                          </div>
                          <div className="db_rm_phase_text">
                            <span className="db_rm_phase_month">Month {phase.month || i + 1}</span>
                            <p className="db_rm_phase_name">{phase.name}</p>
                          </div>
                        </div>
                        {i < (data.roadmap.phases.length - 1) && (
                          <div className={`db_rm_connector${phaseComplete ? " done" : ""}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="db_rm_task_count">
                  {doneTasks} / {totalTasks} tasks complete
                </div>
              </div>
            );
          })()}

          {/* Career Insights */}
          <div className="db_card">
            <div className="db_card_head">
              <div className="db_card_icon bg_teal"><FaChartLine /></div>
              <div>
                <h3>Career Insights</h3>
                <p>{data.target_role} market · {new Date().toLocaleString("default", { month: "short", year: "numeric" })}</p>
              </div>
              <span className="db_link purple_text" style={{cursor:"pointer"}} onClick={() => navigate("/career-insights")}>Full insights ›</span>
            </div>

            <div className="db_stats_grid">
              <div className="db_stat_box">
                <p className="db_stat_val">{data.career_insights.open_roles.toLocaleString()}</p>
                <p className="db_stat_lbl">Open roles</p>
              </div>
              <div className="db_stat_box">
                <p className="db_stat_val">{data.career_insights.median_salary}</p>
                <p className="db_stat_lbl">Median salary</p>
              </div>
              <div className="db_stat_box">
                <p className="db_stat_val">{data.career_insights.demand_growth}</p>
                <p className="db_stat_lbl">Demand growth</p>
              </div>
            </div>

            <p className="db_section_lbl">TOP SKILLS EMPLOYERS WANT</p>

            {data.career_insights.top_skills.map(item => (
              <div key={item.skill} className="db_emp_row">
                <span className="db_emp_name">{item.skill}</span>
                <div className="db_emp_track">
                  <div className="db_emp_fill" style={{ width: `${item.demand}%` }} />
                </div>
              </div>
            ))}

            <p className="db_note">
              <FaGlobeAmericas /> Based on {data.career_insights.open_roles.toLocaleString()} {data.target_role} job postings — last updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Gamified Growth */}
          <div className="db_card">
            <div className="db_card_head">
              <div className="db_card_icon bg_gold"><FaTrophy /></div>
              <div>
                <h3>Gamified Growth</h3>
                <p>XP, streaks &amp; achievements</p>
              </div>
              <div className="db_streak_chip"><FaFire /> {data.streak_days}-day streak</div>
            </div>

            <div className="db_level_card">
              <div className="db_level_left">
                <FaBolt className="level_bolt" />
                <span>Level {data.gamification.level} — {data.gamification.level_name}</span>
              </div>
              <span className="db_xp_text">
                {data.gamification.current_xp.toLocaleString()} / {data.gamification.next_level_xp.toLocaleString()} XP
              </span>
            </div>
            <div className="db_xp_track">
              <div className="db_xp_fill"
                style={{ width: `${Math.max((data.gamification.current_xp / data.gamification.next_level_xp) * 100, 2)}%` }}
              />
            </div>
            <p className="db_xp_sub">
              {(data.gamification.next_level_xp - data.gamification.current_xp).toLocaleString()} XP to Level {data.gamification.level + 1} — {data.gamification.next_level_name}
            </p>

            <p className="db_section_lbl">XP EARNED THIS WEEK</p>
            <div className="db_xp_chart">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const maxXp = Math.max(...data.gamification.weekly_xp, 1);
                return (
                  <div key={day} className="db_xp_col">
                    <div className="db_xp_bar" style={{ height: `${Math.max((data.gamification.weekly_xp[i] / maxXp) * 60, 4)}px` }} />
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>

            <p className="db_section_lbl">RECENT BADGES</p>
            <div className="db_badges_row">
              {data.gamification.badges.map(badge => (
                <div key={badge.name} className={`db_badge ${!badge.earned ? "locked" : ""}`}>
                  <div className="db_badge_circle" style={{ background: badge.earned ? badge.color : "#e5e7eb" }}>
                    {badgeIcons[badge.name]}
                  </div>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
