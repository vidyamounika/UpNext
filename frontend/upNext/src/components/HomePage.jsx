import { useEffect, useRef, useState } from "react";
import "../styles/HomePage.scss";
import UpNext_logo from "../assets/UpNext_logo.png";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [activeSection, setActiveSection] = useState("hero");

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaBoxRef = useRef(null);
  const navigate= useNavigate();

  const scrollToSection = (sectionRef) => {
    sectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const sections = [
      { id: "hero", ref: heroRef },
      { id: "features", ref: featuresRef },
      { id: "howItWorks", ref: howItWorksRef },
      { id: "ctaBtn", ref: ctaBoxRef}
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.45,
      }
    );

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current);
        }
      });
    };
  }, []);

  return (
    <div className="main_content">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo" onClick={() => scrollToSection(heroRef)}>
          <img src={UpNext_logo} alt="UpNext logo" />
        </div>

        <div className="navLinks">
          <p
            className={activeSection === "features" ? "active" : ""}
            onClick={() => scrollToSection(featuresRef)}
          >
            Features
          </p>

          <p
            className={activeSection === "howItWorks" ? "active" : ""}
            onClick={() => scrollToSection(howItWorksRef)}
          >
            How It Works
          </p>

        
          <p
           className={activeSection === "ctaBox" ? "active" : ""}
            onClick={() => scrollToSection(ctaBoxRef)}
          >Blog</p>
        </div>

        <div className="auth_btns">
          <button onClick={()=>navigate("/login")}>Log In</button>
          <button onClick={()=>navigate("/signup")}>Sign Up</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero_section" id="hero" ref={heroRef}>
        <div className="badge">✨ AI-Powered Career Intelligence</div>

        <h1>
          Your next career move,
          <br />
          <span>engineered by AI</span>
        </h1>

        <p>
          UpNext discovers your skill gaps, builds a personalized learning
          roadmap, and coaches you from where you are to where you want to be —
          faster than you thought possible.
        </p>

        <div className="hero_buttons">
          <button className="demo_btn">▷ Watch Demo</button>
        </div>

        <div className="trusted_text">
          Trusted by 12,400+ engineers at Stripe, Vercel, Linear, and more
        </div>
      </section>

      {/* Features Section */}
      <section className="features_section" id="features" ref={featuresRef}>
        <div className="section_badge">Features</div>

        <h2>Everything you need to level up</h2>

        <p className="section_description">
          Six intelligent modules that work together to accelerate your career
          trajectory.
        </p>

        <div className="features_grid">
          <div className="feature_card">
            <div className="feature_icon purple">🧠</div>
            <h3>AI Skill Gap Analysis</h3>
            <p>
              Deep-learning models benchmark your current skills against your
              target role and surface exactly what's missing.
            </p>
          </div>

          <div className="feature_card">
            <div className="feature_icon blue">🗺️</div>
            <h3>Personalized Roadmaps</h3>
            <p>
              Week-by-week learning plans tailored to your schedule, learning
              style, and career timeline.
            </p>
          </div>

          <div className="feature_card">
            <div className="feature_icon blue">📈</div>
            <h3>Career Insights</h3>
            <p>
              Real-time market intelligence: salary bands, in-demand skills, and
              role transition success rates.
            </p>
          </div>

          <div className="feature_card">
            <div className="feature_icon cyan">🏆</div>
            <h3>Gamified Growth</h3>
            <p>
              Earn XP, unlock badges, and maintain streaks that keep you
              accountable to daily learning goals.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="how_it_works_section"
        id="howItWorks"
        ref={howItWorksRef}
      >
        <div className="section_badge blue_badge">How It Works</div>

        <h2>Three steps to your next role</h2>

        <div className="steps_container">
          <div className="step_card">
            <h1>01</h1>
            <h3>Tell us where you are</h3>
            <p>
              Import your LinkedIn or fill in your current role, skills, and
              experience level.
            </p>
          </div>

          <div className="step_card">
            <h1>02</h1>
            <h3>Set your target role</h3>
            <p>
              Pick where you want to be in 6–24 months. UpNext benchmarks you
              instantly.
            </p>
          </div>

          <div className="step_card">
            <h1>03</h1>
            <h3>Follow your roadmap</h3>
            <p>
              Complete weekly tasks, track progress, and watch your readiness
              score climb.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta_section" id="ctaBox" ref={ctaBoxRef}>
        <div className="cta_box" >
          <h2>Ready to accelerate your career?</h2>
          <p>Join 12,400+ engineers already on the path to their next role.</p>
          <button onClick={()=>navigate("/signup")}>Get Started Free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer_logo">
          <img src={UpNext_logo} alt="UpNext logo" />
        </div>

        <p>© 2026 UpNext Technologies Inc. · Privacy · Terms</p>

        <div className="social_icons">
          <span>𝕏</span>
          <span>in</span>
          <span>⌘</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;