import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage'
import HeroPage from './components/HeroPage';
import SignUp from './components/SignUp'
import LogIn from './components/LogIn'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/ForgotPassword';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />}/>
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
