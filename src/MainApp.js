// src/MainApp.js
import React, { useState, useEffect } from 'react';
import Login from './login';
import App from './App';
import Coordinator from './Coordinator';
import Student from './Student';

const MainApp = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('user');
        const savedRole = localStorage.getItem('role');
        
        if (savedUser && savedRole) {
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
        }
        setLoading(false);
    }, []);

    const handleLogin = (userRole, userData) => {
        console.log('Login successful:', { userRole, userData });
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userRole);
        
        // Update state
        setRole(userRole);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
        setRole(null);
        window.location.href = '/login';
    };

    const renderDashboard = () => {
        switch(role) {
            case '25-101': // Coordinator
                return <Coordinator />;
            case '25-102': // Company
                return <App />;
            case '25-103': // Student
                return <Student />;
            default:
                return <Login onLogin={handleLogin} />;
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Loading...
        </div>;
    }

    return (
        <div className="main-app">
            {renderDashboard()}
        </div>
    );
};

export default MainApp;