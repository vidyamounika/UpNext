import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage'
import HeroPage from './components/HeroPage';
import SignUp from './components/SignUp'
import LogIn from './components/LogIn'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/ForgotPassword';
import SkillGapAnalysis from './components/SkillGapAnalysis';
import Roadmap from './components/Roadmap';
import Projects from './components/Projects';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import InterviewPrep from './components/InterviewPrep';
import CareerInsights from './components/CareerInsights';
import Profile from './components/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path="/skill-gap" element={<SkillGapAnalysis />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/interview" element={<InterviewPrep />} />
        <Route path="/career-insights" element={<CareerInsights />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
