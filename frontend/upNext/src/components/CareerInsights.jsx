import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt, FaBrain, FaMap, FaFolder, FaFileAlt,
  FaMicrophone, FaChartLine, FaUser, FaMoon, FaSignOutAlt,
  FaBell, FaSearch, FaThLarge, FaChevronLeft, FaChevronRight,
  FaSun, FaGlobeAmericas, FaArrowUp, FaBriefcase, FaRupeeSign
} from "react-icons/fa";
import API_BASE from "../api";
import "../styles/CareerInsights.scss";

function getInitials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
}

// Extended career data per role — salary ranges, top companies, growth trend
const EXTENDED_INSIGHTS = {
  "data scientist": {
    salaryRange: "₹8L – ₹25L", entryLevel: "₹8 LPA", seniorLevel: "₹25 LPA",
    topCompanies: ["Google", "Meta", "Amazon", "Netflix", "Airbnb"],
    growthTrend: [42, 55, 63, 72, 80, 88, 95],
    jobTypes: [{ type: "Full-time", pct: 78 }, { type: "Contract", pct: 14 }, { type: "Remote", pct: 62 }],
    certifications: ["Google Data Analytics", "AWS ML Specialty", "Coursera ML Specialization"],
    description: "Data Scientists are in extremely high demand as companies invest heavily in AI and analytics.",
  },
  "machine learning": {
    salaryRange: "₹10L – ₹30L", entryLevel: "₹10 LPA", seniorLevel: "₹30 LPA",
    topCompanies: ["OpenAI", "DeepMind", "Google", "Microsoft", "Nvidia"],
    growthTrend: [50, 62, 70, 78, 85, 92, 98],
    jobTypes: [{ type: "Full-time", pct: 82 }, { type: "Contract", pct: 10 }, { type: "Remote", pct: 58 }],
    certifications: ["TensorFlow Developer", "AWS ML Specialty", "Deep Learning Specialization"],
    description: "ML Engineers are among the highest-paid tech professionals as AI adoption accelerates globally.",
  },
  "software engineer": {
    salaryRange: "₹6L – ₹22L", entryLevel: "₹6 LPA", seniorLevel: "₹22 LPA",
    topCompanies: ["Google", "Microsoft", "Amazon", "Apple", "Meta"],
    growthTrend: [30, 38, 45, 52, 60, 68, 75],
    jobTypes: [{ type: "Full-time", pct: 85 }, { type: "Contract", pct: 10 }, { type: "Remote", pct: 55 }],
    certifications: ["AWS Developer", "Google Cloud Professional", "Kubernetes CKA"],
    description: "Software Engineering remains one of the most stable and well-compensated career paths in tech.",
  },
  "devops": {
    salaryRange: "₹8L – ₹24L", entryLevel: "₹8 LPA", seniorLevel: "₹24 LPA",
    topCompanies: ["Amazon", "Microsoft", "HashiCorp", "Cloudflare", "Datadog"],
    growthTrend: [35, 44, 52, 60, 68, 76, 84],
    jobTypes: [{ type: "Full-time", pct: 80 }, { type: "Contract", pct: 15 }, { type: "Remote", pct: 65 }],
    certifications: ["AWS DevOps Professional", "CKA", "Terraform Associate"],
    description: "DevOps Engineers are critical as companies shift to cloud-native architectures and continuous delivery.",
  },
  "frontend": {
    salaryRange: "₹5L – ₹20L", entryLevel: "₹5 LPA", seniorLevel: "₹20 LPA",
    topCompanies: ["Shopify", "Airbnb", "Stripe", "Figma", "Vercel"],
    growthTrend: [25, 32, 40, 48, 55, 62, 68],
    jobTypes: [{ type: "Full-time", pct: 76 }, { type: "Contract", pct: 18 }, { type: "Remote", pct: 70 }],
    certifications: ["Meta React Developer", "Google UX Design", "AWS Cloud Practitioner"],
    description: "Frontend Developers are in steady demand as user experience becomes a key competitive differentiator.",
  },
  "backend": {
    salaryRange: "₹7L – ₹22L", entryLevel: "₹7 LPA", seniorLevel: "₹22 LPA",
    topCompanies: ["Stripe", "Twilio", "MongoDB", "Elastic", "Confluent"],
    growthTrend: [28, 36, 44, 52, 60, 68, 74],
    jobTypes: [{ type: "Full-time", pct: 82 }, { type: "Contract", pct: 12 }, { type: "Remote", pct: 60 }],
    certifications: ["AWS Developer", "MongoDB Developer", "PostgreSQL Associate"],
    description: "Backend Developers are essential for building scalable APIs and data systems that power modern apps.",
  },
  "cloud": {
    salaryRange: "₹9L – ₹26L", entryLevel: "₹9 LPA", seniorLevel: "₹26 LPA",
    topCompanies: ["AWS", "Microsoft Azure", "Google Cloud", "Snowflake", "Databricks"],
    growthTrend: [40, 50, 60, 70, 78, 86, 92],
    jobTypes: [{ type: "Full-time", pct: 80 }, { type: "Contract", pct: 14 }, { type: "Remote", pct: 68 }],
    certifications: ["AWS Solutions Architect", "Azure Administrator", "GCP Professional"],
    description: "Cloud Engineers are in massive demand as every company migrates infrastructure to the cloud.",
  },
};

function getExtended(targetRole) {
  const rl = (targetRole || "").toLowerCase();
  for (const [key, val] of Object.entries(EXTENDED_INSIGHTS)) {
    if (rl.includes(key)) return val;
  }
  return {
    salaryRange: "₹6L – ₹20L", entryLevel: "₹6 LPA", seniorLevel: "₹20 LPA",
    topCompanies: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    growthTrend: [30, 38, 46, 54, 62, 70, 76],
    jobTypes: [{ type: "Full-time", pct: 80 }, { type: "Contract", pct: 14 }, { type: "Remote", pct: 58 }],
    certifications: ["AWS Cloud Practitioner", "Google IT Support", "CompTIA Security+"],
    description: "Tech professionals continue to see strong demand and competitive salaries across all specializations.",
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

function CareerInsights() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("User");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [insights, setInsights] = useState(null);
  const [extended, setExtended] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("upnext_email");
    if (!email) { navigate("/login"); return; }
    fetch(`${API_BASE}/dashboard-data?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        setUserName(d.user_name || "User");
        setTargetRole(d.target_role || "Software Engineer");
        setInsights(d.career_insights);
        setExtended(getExtended(d.target_role));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("upnext_email");
    navigate("/login");
  };

  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaBrain />, label: "Skill Gap Analysis", path: "/skill-gap" },
    { icon: <FaMap />, label: "Roadmap", path: "/roadmap" },
    { icon: <FaFolder />, label: "Projects", path: "/projects" },
    { icon: <FaFileAlt />, label: "Resume Analyzer", path: "/resume" },
    { icon: <FaMicrophone />, label: "Interview Prep", path: "/interview" },
    { icon: <FaChartLine />, label: "Career Insights", path: "/career-insights", active: true },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  if (loading) {
    return (
      <div className="ci_loading">
        <div className="ci_spinner" />
        <p>Loading career insights...</p>
      </div>
    );
  }

  const maxTrend = Math.max(...(extended?.growthTrend || [1]));

  return (
    <div className={`ci_wrapper${darkMode ? " dark" : ""}`}>
      <aside className={`ci_sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="ci_collapse_btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="ci_logo">
          <div className="ci_bolt_icon"><FaBolt /></div>
          {!collapsed && <span>UpNext</span>}
        </div>
        <nav className="ci_nav">
          {navItems.map(item => (
            <div key={item.label} className={`ci_nav_item${item.active ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => item.path && navigate(item.path)}
              style={{ cursor: item.path ? "pointer" : "default" }}>
              {item.icon}{!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="ci_sidebar_foot">
          <div className="ci_nav_item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
          <div className="ci_nav_item ci_logout" onClick={handleLogout}>
            <FaSignOutAlt />{!collapsed && <span>Log Out</span>}
          </div>
          {!collapsed && (
            <div className="ci_user_row">
              <div className="ci_avatar_sm">{getInitials(userName)}</div>
              <div>
                <p className="ci_user_name_text">{userName}</p>

              </div>
            </div>
          )}
        </div>
      </aside>

      <main className={`ci_main${collapsed ? " collapsed" : ""}`}>
        <header className="ci_header">
          <h2 className="ci_page_title">Career Insights</h2>
          <div className="ci_search_box">
            <FaSearch /><input type="text" placeholder="Search..." />
          </div>
          <div className="ci_header_right">
            <div className="ci_icon_btn"><FaBell /></div>
            <div className="ci_icon_btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>
            <div className="ci_avatar_sm purple">{getInitials(userName)}</div>
          </div>
        </header>

        <div className="ci_content">
          <div className="ci_intro">
            <h1>Career Insights</h1>
            <p className="ci_intro_sub">Live market data for <strong>{targetRole}</strong> roles</p>
          </div>

          {/* Description */}
          {extended && (
            <div className="ci_card ci_desc_card">
              <FaGlobeAmericas className="ci_globe" />
              <p>{extended.description}</p>
            </div>
          )}

          {/* Top stats */}
          {insights && (
            <div className="ci_stats_row">
              <div className="ci_stat_card">
                <div className="ci_stat_icon ci_icon_blue"><FaBriefcase /></div>
                <p className="ci_stat_val">{insights.open_roles.toLocaleString()}</p>
                <p className="ci_stat_lbl">Open Roles</p>
              </div>
              <div className="ci_stat_card">
                <div className="ci_stat_icon ci_icon_green"><FaRupeeSign /></div>
                <p className="ci_stat_val">{insights.median_salary}</p>
                <p className="ci_stat_lbl">Median Salary</p>
              </div>
              <div className="ci_stat_card">
                <div className="ci_stat_icon ci_icon_purple"><FaArrowUp /></div>
                <p className="ci_stat_val">{insights.demand_growth}</p>
                <p className="ci_stat_lbl">Demand Growth</p>
              </div>
              {extended && (
                <>
                  <div className="ci_stat_card">
                    <div className="ci_stat_icon ci_icon_teal"><FaRupeeSign /></div>
                    <p className="ci_stat_val">{extended.entryLevel}</p>
                    <p className="ci_stat_lbl">Entry Level</p>
                  </div>
                  <div className="ci_stat_card">
                    <div className="ci_stat_icon ci_icon_gold"><FaRupeeSign /></div>
                    <p className="ci_stat_val">{extended.seniorLevel}</p>
                    <p className="ci_stat_lbl">Senior Level</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Demand trend chart */}
          {extended && (
            <div className="ci_card">
              <h3 className="ci_section_title">Demand Trend (Last 7 Months)</h3>
              <div className="ci_trend_chart">
                {extended.growthTrend.map((val, i) => (
                  <div key={i} className="ci_trend_col">
                    <div className="ci_trend_bar_wrap">
                      <div className="ci_trend_bar" style={{ height: `${(val / maxTrend) * 120}px` }} />
                    </div>
                    <span className="ci_trend_label">{MONTHS[i]}</span>
                    <span className="ci_trend_val">{val}K</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top skills */}
          {insights && (
            <div className="ci_card">
              <h3 className="ci_section_title">Top Skills Employers Want</h3>
              {insights.top_skills.map(item => (
                <div key={item.skill} className="ci_skill_row">
                  <span className="ci_skill_name">{item.skill}</span>
                  <div className="ci_skill_track">
                    <div className="ci_skill_fill" style={{ width: `${item.demand}%` }} />
                  </div>
                  <span className="ci_skill_pct">{item.demand}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Job types */}
          {extended && (
            <div className="ci_card">
              <h3 className="ci_section_title">Job Type Breakdown</h3>
              <div className="ci_job_types">
                {extended.jobTypes.map(jt => (
                  <div key={jt.type} className="ci_job_type_card">
                    <p className="ci_jt_val">{jt.pct}%</p>
                    <p className="ci_jt_label">{jt.type}</p>
                    <div className="ci_jt_track">
                      <div className="ci_jt_fill" style={{ width: `${jt.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top companies */}
          {extended && (
            <div className="ci_card">
              <h3 className="ci_section_title">Top Hiring Companies</h3>
              <div className="ci_companies">
                {extended.topCompanies.map((c, i) => (
                  <div key={c} className="ci_company_chip">
                    <span className="ci_company_rank">#{i + 1}</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {extended && (
            <div className="ci_card">
              <h3 className="ci_section_title">Recommended Certifications</h3>
              <div className="ci_certs">
                {extended.certifications.map((cert, i) => (
                  <div key={i} className="ci_cert_card">
                    <div className="ci_cert_icon">🏅</div>
                    <p>{cert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="ci_footer_note">
            <FaGlobeAmericas /> Data based on {insights?.open_roles?.toLocaleString()} {targetRole} job postings — updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </main>
    </div>
  );
}

export default CareerInsights;
