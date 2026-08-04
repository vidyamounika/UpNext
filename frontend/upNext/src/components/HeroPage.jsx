import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HeroPage.scss";

const HeroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="hero-content">
        {/* Logo */}

        <h1 className="upnext-logo">
          <span className="up">Up</span>
          <span className="next">Next</span>

          <span className="arrow">↗</span>
        </h1>

        <p className="tagline">
          Discover your skill gaps, build a personalized learning roadmap,
          and get AI-powered coaching that takes you from where you are to
          where you want to be — faster than you thought possible.
        </p>

        <button
          className="start-btn"
          onClick={() => navigate("/home")}
        >
          Let's Get Started
        </button>
      </div>

      <div className="floating-icons">
        <div>🎯</div>
        <div>📈</div>
        <div>🚀</div>
        <div>💡</div>
      </div>
    </div>
  );
};

export default HeroPage;