import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import API_BASE from "../api";
import "../styles/ForgotPassword.scss";

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(location.state?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorPopup = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showErrorPopup("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorPopup("Passwords do not match");
      return;
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongPassword.test(newPassword)) {
      showErrorPopup(
        "Password must have 8+ characters, uppercase, lowercase, number and special character"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/reset-password`, {
        email,
        new_password: newPassword,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/login");
      }, 1500);
    } catch (error) {
      showErrorPopup(
        error.response?.data?.detail || "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot_container">
      {showSuccess && <div className="success_box">Password reset successful!</div>}
      {showError && <div className="error_box">{errorMessage}</div>}

      <div className="forgot_card">
        <button className="back_btn" onClick={() => navigate("/login")}>
          ← Back to Login
        </button>

        <h1>Reset Password</h1>

        <p className="subtitle">Enter your new password below.</p>

        <label>Email</label>
        <input type="email" value={email} readOnly className="readonly_input" />

        <label>New Password</label>
        <div className="input_box">
          <FaLock />
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {showNewPassword ? (
            <FaEyeSlash className="eye_icon" onClick={() => setShowNewPassword(false)} />
          ) : (
            <FaEye className="eye_icon" onClick={() => setShowNewPassword(true)} />
          )}
        </div>

        <label>Confirm Password</label>
        <div className="input_box">
          <FaLock />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {showConfirmPassword ? (
            <FaEyeSlash className="eye_icon" onClick={() => setShowConfirmPassword(false)} />
          ) : (
            <FaEye className="eye_icon" onClick={() => setShowConfirmPassword(true)} />
          )}
        </div>

        <button
          className="reset_btn"
          onClick={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
