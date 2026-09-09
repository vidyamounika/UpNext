import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight,
  FaSun, FaEdit, FaCheck, FaTimes
} from "react-icons/fa";
import API_BASE from "../api";
import "../styles/Profile.scss";

function getInitials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
}

function Profile() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "", email: "", currentRole: "", targetRole: "",
    experience: "", timeline: "", goal: "", skills: [],
  });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", ok: false });
  const [showPwForm, setShowPwForm] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    fetch(`${API_BASE}/dashboard-data?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        setProfile({
          name: d.full_name || d.user_name || "",
          email,
          currentRole: d.current_role || "",
          targetRole: d.target_role || "",
          experience: d.experience || "",
          timeline: d.roadmap?.plan_duration || "",
          goal: d.primary_goal || "",
          skills: (d.skill_gap?.skills || []).filter(s => s.user_level > 0).map(s => s.name || s),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ text: "New passwords do not match.", ok: false }); return;
    }
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, new_password: pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ text: "Password changed successfully!", ok: true });
        setPwForm({ current: "", newPw: "", confirm: "" });
        setShowPwForm(false);
      } else {
        setPwMsg({ text: data.detail || "Failed to change password.", ok: false });
      }
    } catch {
      setPwMsg({ text: "Server error. Try again.", ok: false });
    }
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights" },
    { icon: <FaUser />, label: "Profile", path: "/profile", active: true },
  ];

  return (
    <div className={`pr_wrapper${darkMode ? " dark" : ""}`}>
      <aside className={`pr_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="pr_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="pr_logo">
          <div className="pr_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>
        <nav className="pr_nav">
          {navItems.map(item => (
            <div key={item.label} className={`pr_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}>
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="pr_sidebar_foot">
          <div className="pr_nav_item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="pr_nav_item pr_logout" onClick={handleLogout}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="pr_user_row">
              <div className="pr_avatar_sm">{getInitials(profile.name)}</div>
              <div><p className="pr_user_name_text">{profile.name}</p></div>
            </div>
          )}
        </div>
      </aside>

      <main className={`pr_main${collapsed ? " collapsed" : ""}`}>
        <header className="pr_header">
          <h2 className="pr_page_title">Profile</h2>
          <div className="pr_search_box">
            <FaSearch /><input type="text" placeholder="Search..." />
          </div>
          <div className="pr_header_right">
            <div className="pr_icon_btn"><FaBell /></div>
            <div className="pr_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="pr_avatar_sm purple">{getInitials(profile.name)}</div>
          </div>
        </header>

        <div className="pr_content">
          {loading ? (
            <div className="pr_loading">
              <div className="pr_spinner" />
              <p>Loading your profile...</p>
            </div>
          ) : (
            <>
              {/* Avatar + name */}
              <div className="pr_card pr_hero_card">
                <div className="pr_avatar_lg">{getInitials(profile.name)}</div>
                <div>
                  <h1 className="pr_hero_name">{profile.name}</h1>
                  <p className="pr_hero_email">{profile.email}</p>
                  <span className="pr_role_chip">{profile.targetRole}</span>
                </div>
              </div>

              <div className="pr_grid">
                {/* Career Info */}
                <div className="pr_card">
                  <h3 className="pr_card_title">Career Info</h3>
                  <div className="pr_info_list">
                    <div className="pr_info_row">
                      <span className="pr_info_label">Current Role</span>
                      <span className="pr_info_value">{profile.currentRole || "—"}</span>
                    </div>
                    <div className="pr_info_row">
                      <span className="pr_info_label">Target Role</span>
                      <span className="pr_info_value">{profile.targetRole || "—"}</span>
                    </div>
                    <div className="pr_info_row">
                      <span className="pr_info_label">Experience</span>
                      <span className="pr_info_value">{profile.experience || "—"}</span>
                    </div>
                    <div className="pr_info_row">
                      <span className="pr_info_label">Timeline</span>
                      <span className="pr_info_value">{profile.timeline || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="pr_card">
                  <h3 className="pr_card_title">Your Skills</h3>
                  {profile.skills.length > 0 ? (
                    <div className="pr_skills_wrap">
                      {profile.skills.map(s => (
                        <span key={s} className="pr_skill_tag">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="pr_empty">No skills found.</p>
                  )}
                </div>
              </div>

              {/* Change Password */}
              <div className="pr_card">
                <div className="pr_card_header">
                  <h3 className="pr_card_title">Change Password</h3>
                  <button className="pr_edit_btn" onClick={() => { setShowPwForm(!showPwForm); setPwMsg({ text: "", ok: false }); }}>
                    {showPwForm ? <><FaTimes /> Cancel</> : <><FaEdit /> Change</>}
                  </button>
                </div>
                {pwMsg.text && (
                  <p className={`pr_pw_msg${pwMsg.ok ? " ok" : " err"}`}>{pwMsg.text}</p>
                )}
                {showPwForm && (
                  <form className="pr_pw_form" onSubmit={handlePwSubmit}>
                    <input type="password" placeholder="New password" value={pwForm.newPw}
                      onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required />
                    <input type="password" placeholder="Confirm new password" value={pwForm.confirm}
                      onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
                    <button type="submit" className="pr_save_btn"><FaCheck /> Save Password</button>
                  </form>
                )}
              </div>

              {/* Danger zone */}
              <div className="pr_card pr_danger_card">
                <h3 className="pr_card_title">Account</h3>
                <button className="pr_logout_btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
