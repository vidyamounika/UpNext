import React, { useState } from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBolt,
  FaCheck,
  FaArrowRight,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import UpNext_logo from "../assets/UpNext_logo.png";
import "../styles/LogIn.scss";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(location.state?.startOnboarding || false);
  const [step, setStep] = useState(1);

  const [currentRole, setCurrentRole] = useState("");
  const [experience, setExperience] = useState("0-1 years");
  const [targetRole, setTargetRole] = useState("");

  const commonSkills = [
    "React",
    "Vue",
    "Angular",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Go",
    "Rust",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "PostgreSQL",
    "Redis",
    "CSS",
    "Git",
    "CI/CD",
    "System Design",
    "Leadership",
  ];

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");

  const [timeline, setTimeline] = useState("3 months");
  const [primaryGoal, setPrimaryGoal] = useState("");

  const validateForm = () => {
    let newErrors = {};

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const showErrorPopup = (message) => {
    setErrorMessage(message);
    setShowError(true);

    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        email,
        password,
      });

      if (response.data.message === "Login Successful") {
        if (response.data.onboarding_complete) {
          localStorage.setItem("upnext_email", email);
          navigate("/dashboard");
        } else {
          setIsLoggedIn(true);
          setStep(1);
        }
      } else {
        showErrorPopup(response.data.message);
      }
    } catch (error) {
      showErrorPopup(error.response?.data?.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const cameFromSignup = location.state?.startOnboarding || false;

  const handleBackToLogin = () => {
    if (cameFromSignup) {
      navigate("/signup");
    } else {
      setIsLoggedIn(false);
      setStep(1);
      setCurrentRole("");
      setExperience("0-1 years");
      setTargetRole("");
      setSelectedSkills([]);
      setCustomSkill("");
      setTimeline("3 months");
      setPrimaryGoal("");
    }
  };

  const handleRoleContinue = () => {
    if (!currentRole.trim()) {
      showErrorPopup("Please enter your current role");
      return;
    }

    if (!targetRole.trim()) {
      showErrorPopup("Please enter your target role");
      return;
    }

    setStep(2);
  };

  const handleSkillClick = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((item) => item !== skill));
    } else {
      if (selectedSkills.length >= 10) {
        showErrorPopup("You can add only up to 10 skills");
        return;
      }

      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) {
      showErrorPopup("Please enter a skill");
      return;
    }

    if (selectedSkills.includes(skill)) {
      showErrorPopup("Skill already added");
      return;
    }

    if (selectedSkills.length >= 10) {
      showErrorPopup("You can add only up to 10 skills");
      return;
    }

    setSelectedSkills([...selectedSkills, skill]);
    setCustomSkill("");
  };

  const handleSkillsContinue = () => {
    if (selectedSkills.length === 0) {
      showErrorPopup("Please select or add at least one skill");
      return;
    }

    setStep(3);
  };

  const handleLaunchRoadmap = async () => {
    if (!primaryGoal) {
      showErrorPopup("Please select your primary goal");
      return;
    }

    setIsLaunching(true);
    try {
      await axios.post("http://127.0.0.1:8000/save-onboarding", {
        email,
        current_role: currentRole,
        experience,
        target_role: targetRole,
        skills: selectedSkills,
        timeline,
        primary_goal: primaryGoal,
      });

      localStorage.setItem("upnext_email", email);
      navigate("/dashboard");
    } catch (error) {
      showErrorPopup(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to save onboarding"
      );
    } finally {
      setIsLaunching(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="onboarding_container">
        {showError && <div className="error_box">{errorMessage}</div>}

        <div className="onboarding_logo">
          <div className="bolt_icon">
            <FaBolt />
          </div>
          <h2>UpNext</h2>
        </div>

        <div className="stepper">
          <div className={`step_item ${step >= 1 ? "active" : ""}`}>
            <span>{step > 1 ? <FaCheck /> : "1"}</span>
            <p>Your Role</p>
          </div>

          <div className="step_line"></div>

          <div className={`step_item ${step >= 2 ? "active" : ""}`}>
            <span>{step > 2 ? <FaCheck /> : "2"}</span>
            <p>Your Skills</p>
          </div>

          <div className="step_line"></div>

          <div className={`step_item ${step >= 3 ? "active" : ""}`}>
            <span>3</span>
            <p>Your Goals</p>
          </div>
        </div>

        {step === 1 && (
          <div className="onboarding_card">
            <h1>Tell us about yourself</h1>

            <p className="onboarding_subtitle">
              Help UpNext benchmark you accurately against your target role.
            </p>

            <label>Current Role</label>
            <input
              type="text"
              placeholder="Example: Frontend Developer"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />

            <label>Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option>0-1 years</option>
              <option>1-3 years</option>
              <option>3-5 years</option>
              <option>5+ years</option>
            </select>

            <label>Target Role</label>
            <input
              type="text"
              placeholder="Example: Full Stack Developer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />

            <div className="btn_row">
              <button className="secondary_btn" onClick={handleBackToLogin}>
                {cameFromSignup ? "Back to Sign Up" : "Back to Login"}
              </button>

              <button className="primary_btn" onClick={handleRoleContinue}>
                Continue <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding_card">
            <h1>Select your current skills</h1>

            <p className="onboarding_subtitle">
              Pick common skills or add your own custom skills manually.
            </p>

            <div className="skills_grid">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  className={`skill_chip ${
                    selectedSkills.includes(skill) ? "selected" : ""
                  }`}
                  onClick={() => handleSkillClick(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="custom_skill_box">
              <input
                type="text"
                placeholder="Add custom skill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
              />

              <button onClick={handleAddCustomSkill}>
                <FaPlus /> Add
              </button>
            </div>

            {selectedSkills.length > 0 && (
              <div className="selected_skills">
                {selectedSkills.map((skill) => (
                  <span key={skill}>
                    {skill}
                    <FaTimes onClick={() => handleSkillClick(skill)} />
                  </span>
                ))}
              </div>
            )}

            <p className="skill_count">
              {selectedSkills.length}/10 skills selected
            </p>

            <div className="btn_row">
              <button className="secondary_btn" onClick={() => setStep(1)}>
                Back
              </button>

              <button className="primary_btn" onClick={handleSkillsContinue}>
                Continue <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding_card goals_card">
            <h1>Set your career goals</h1>

            <p className="onboarding_subtitle">
              What matters most to you in your next role?
            </p>

            <label>Target Timeline</label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            >
              <option>3 months</option>
              <option>6 months</option>
              <option>9 months</option>
              <option>12 months</option>
            </select>

            <label>Primary Goal</label>

            {[
              "Get promoted at current company",
              "Switch to a larger tech company",
              "Move into management",
              "Increase total compensation",
              "Transition to a new domain",
            ].map((goal) => (
              <div
                key={goal}
                className={`goal_option ${
                  primaryGoal === goal ? "selected" : ""
                }`}
                onClick={() => setPrimaryGoal(goal)}
              >
                <span></span>
                <p>{goal}</p>
              </div>
            ))}

            <div className="btn_row">
              <button className="secondary_btn" onClick={() => setStep(2)} disabled={isLaunching}>
                Back
              </button>

              <button className="primary_btn" onClick={handleLaunchRoadmap} disabled={isLaunching}>
                {isLaunching ? "Launching..." : <> Launch My Roadmap <FaArrowRight /> </>}
              </button>
            </div>

            {isLaunching && (
              <div className="launch_loader">
                <div className="launch_spinner"></div>
                <p>Validating your profile...</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="login_container">
      {showSuccess && <div className="success_box">Login Successful!</div>}

      {showError && <div className="error_box">{errorMessage}</div>}

      <div className="login_card">
        <div className="back_home" onClick={() => navigate("/home")}>
          <FaArrowLeft />
          <span>Back to home</span>
        </div>

        <div className="logo_section">
          <img src={UpNext_logo} alt="UpNext Logo" />
        </div>

        <h1>Welcome Back</h1>

        <p className="subtitle">Continue your AI-powered career journey.</p>

        <form className="login_form" onSubmit={handleLogin}>
          <label>Email</label>

          <div className="input_box">
            <FaEnvelope />

            <input
              type="email"
              placeholder="abc@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {errors.email && <p className="error_text">{errors.email}</p>}

          <label>Password</label>

          <div className="input_box">
            <FaLock />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {showPassword ? (
              <FaEyeSlash
                className="eye_icon"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <FaEye
                className="eye_icon"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {errors.password && <p className="error_text">{errors.password}</p>}

          <div
  className="forgot_password"
  onClick={() =>
    navigate("/forgot-password", {
      state: {
        email: email
      }
    })
  }
>
  Forgot Password?
</div>

          <button type="submit" className="login_btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In →"}
          </button>
        </form>

        <div className="signup_text">
          Don't have an account?
          <span onClick={() => navigate("/signup")}> Create Account</span>
        </div>
      </div>
    </div>
  );
}

export default Login;