// src/MainApp.js
import React, { useState, useEffect } from 'react';
import Login from './login';
import App from './App';
import Coordinator from './Coordinator';
import Student from './Student'; // You'll need to create this

const MainApp = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('user');
        const savedRole = localStorage.getItem('role');
        const savedUserType = localStorage.getItem('userType');
        
        if (savedUser && savedRole && savedUserType) {
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
            setUserType(savedUserType);
        }
    }, []);

    const handleLogin = (userRole, userData, userType) => {
        setRole(userRole);
        setUser(userData);
        setUserType(userType);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('userType');
        setUser(null);
        setRole(null);
        setUserType(null);
    };

    const renderDashboard = () => {
        switch(role) {
            case '25-101': // Coordinator
                return <Coordinator user={user} onLogout={handleLogout} />;
            case '25-102': // Company
                return <App user={user} onLogout={handleLogout} />;
            case '25-103': // Student
                return <Student user={user} onLogout={handleLogout} />;
            default:
                return <Login onLogin={handleLogin} />;
        }
    };

    return (
        <div className="main-app">
            {renderDashboard()}
        </div>
    );
};

export default MainApp;