import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/login';
import Profile from './components/profile';
import LeaveForm from './components/leaveForm';
import { useMsal } from '@azure/msal-react';
import './App.css';
import Chatbot from './Chatbot';

export default function App() {
  const { accounts } = useMsal();
  const signedIn = accounts && accounts.length > 0;

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <h1 className="navbar-title">Leave Desk</h1>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          {signedIn && <Link to="/profile">Profile</Link>}
          {signedIn && <Link to="/leave">Request Leave</Link>}
          <Link to="/login">{signedIn ? 'Switch User' : 'Login'}</Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="main-container">
        <Routes>
            <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leave" element={<LeaveForm />} />
        </Routes>
      </div>
      <Chatbot />
    </div>
  );
}
