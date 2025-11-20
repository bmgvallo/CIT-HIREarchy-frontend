// MainApp.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import App from './App';
import Student from './Student';
import Coordinator from './Coordinator';
import Profile from './Profile';

// Navigation Component
function Navigation() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const getButtonStyle = (path) => ({
    padding: '10px 20px',
    backgroundColor: currentPath.includes(path) ? '#2A0001' : '#450000',
    color: 'white',
    border: '1px solid white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block'
  });

  return (
    <div style={{
      padding: '10px 20px', 
      backgroundColor: '#450000', 
      color: 'white',
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <button 
        onClick={() => window.location.href = '/company'}
        style={getButtonStyle('/company')}
      >
        🏢 Company View
      </button>
      <button 
        onClick={() => window.location.href = '/student'}
        style={getButtonStyle('/student')}
      >
        🎓 Student View
      </button>
      <button 
        onClick={() => window.location.href = '/coordinator'}
        style={getButtonStyle('/coordinator')}
      >
        👨‍💼 Coordinator View
      </button>
    </div>
  );
}

function MainApp() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/company" replace />} />
          
          {/* Company routes */}
          <Route path="/company" element={<App />} />
          
          {/* Student routes */}
          <Route path="/student" element={<Student />} />
          <Route path="/student/profile" element={<Profile />} />
          
          {/* Coordinator routes */}
          <Route path="/coordinator" element={<Coordinator />} />
          
          {/* Fallback route */}
          <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default MainApp;