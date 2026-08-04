import React, { useState } from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UpNext_logo from "../assets/UpNext_logo.png";
import "../styles/SignUp.scss";
import axios from "axios";



function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showCfrmPassword, setShowCfrmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validateForm = () => {
    let newErrors = {};

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const strongPasswordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!strongPasswordPattern.test(formData.password)) {
      newErrors.password =
        "Password must have 8 characters, uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password and confirm password should match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const showErrorPopup = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/signup", {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.message === "Signup Successful") {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/login", { state: { startOnboarding: true, email: formData.email } });
        }, 1500);
      } else {
        showErrorPopup(response.data.message);
      }
    } catch (error) {
      showErrorPopup(error.response?.data?.message || "Signup Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup_container">
      {showSuccess && <div className="success_box">Account successfully created!</div>}
      {showError && <div className="error_box">{errorMessage}</div>}

      <div className="signup_card">
        <div className="back_home" onClick={() => navigate("/home")}>
          <FaArrowLeft />
          <span>Back to home</span>
        </div>

        <div className="logo_section">
          <img src={UpNext_logo} alt="UpNext Logo" />
        </div>

        <h1>Create your account</h1>

        <p className="subtitle">
          Start your AI-powered career journey for free.
        </p>

        <form className="signup_form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <div className="input_box">
            <FaUser />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          {errors.fullName && <p className="error_text">{errors.fullName}</p>}

          <label>Email</label>
          <div className="input_box">
            <FaEnvelope />
            <input
              type="email"
              name="email"
              placeholder="abc@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <p className="error_text">{errors.email}</p>}

          <label>Password</label>
          <div className="input_box">
            <FaLock />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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

          <label>Confirm Password</label>
          <div className="input_box">
            <FaLock />
            <input
              type={showCfrmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {showCfrmPassword ? (
              <FaEyeSlash
                className="eye_icon"
                onClick={() => setShowCfrmPassword(false)}
              />
            ) : (
              <FaEye
                className="eye_icon"
                onClick={() => setShowCfrmPassword(true)}
              />
            )}
          </div>
          {errors.confirmPassword && (
            <p className="error_text">{errors.confirmPassword}</p>
          )}

          <button type="submit" className="create_btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <div className="signin_text">
          Already have an account?
          <span onClick={() => navigate("/login")}> Log in</span>
        </div>
      </div>
    </div>
  );
}

export default SignUp;