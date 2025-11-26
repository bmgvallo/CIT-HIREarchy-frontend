// src/Login.js
import React, { useState } from 'react';
import './login.css';

// CIT-U Courses Constants
const CIT_U_COURSES = [
  // CEA
  'BS Architecture',
  'BS Chemical Engineering',
  'BS Civil Engineering',
  'BS Computer Engineering',
  'BS Electrical Engineering',
  'BS Electronics Engineering',
  'BS Industrial Engineering',
  'BS Mechanical Engineering',
  'BS Mining Engineering',
  // CMBA
  'BS Accountancy',
  'BS Accounting Information Systems',
  'BS Management Accounting',
  'BS Business Administration',
  'BS Hospitality Management',
  'BS Tourism Management',
  'BS Office Administration',
  'Bachelor in Public Administration',
  // CASE
  'AB Communication',
  'AB English with Applied Linguistics',
  'Bachelor of Elementary Education',
  'Bachelor of Secondary Education',
  'Bachelor of Multimedia Arts',
  'BS Biology',
  'BS Math with Applied Industrial Mathematics',
  'BS Psychology',
  // CNAHS
  'BS Nursing',
  'BS Pharmacy',
  'BS Medical Technology',
  // CCS
  'BS Information Technology',
  'BS Computer Science',
  // CCJ
  'BS Criminology'
];

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: '25-103', // Default to student
        companyName: '',
        firstName: '',
        lastName: '',
        studentId: '',
        department: '',
        contactPerson: '',
        contactPhone: '',
        program: '', // CHANGED: Now using string for program
        yearLevel: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (isLogin) {
                // Login logic
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('userType', data.userType);
                    onLogin(data.role, data.user, data.userType);
                } else {
                    const error = await response.text();
                    alert(error);
                }
            } else {
                // Registration logic
                let endpoint = '';
                let userData = {};

                switch(formData.role) {
                    case '25-101': // Coordinator
                        endpoint = '/register/coordinator';
                        userData = {
                            username: formData.username,
                            email: formData.email,
                            coordinatorName: `${formData.firstName} ${formData.lastName}`,
                            coordinatorDepartment: formData.department
                        };
                        break;
                    case '25-102': // Company
                        endpoint = '/register/company';
                        userData = {
                            username: formData.username,
                            email: formData.email,
                            companyName: formData.companyName,
                            companyDescription: '',
                            contactPerson: formData.contactPerson,
                            contactPhone: formData.contactPhone
                        };
                        break;
                    case '25-103': // Student
                        endpoint = '/register/student';
                        userData = {
                            username: formData.username,
                            email: formData.email,
                            studName: `${formData.firstName} ${formData.lastName}`,
                            studProgram: formData.program, // CHANGED: Now using string
                            studYrLevel: formData.yearLevel,
                            course: formData.program // NEW: Add course field for backend
                        };
                        break;
                }
                
                const response = await fetch(`http://localhost:8080/api/auth${endpoint}?password=${formData.password}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                
                if (response.ok) {
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                    // Reset form
                    setFormData({
                        username: '',
                        password: '',
                        email: '',
                        role: '25-103',
                        companyName: '',
                        firstName: '',
                        lastName: '',
                        studentId: '',
                        department: '',
                        contactPerson: '',
                        contactPhone: '',
                        program: '',
                        yearLevel: ''
                    });
                } else {
                    const error = await response.text();
                    alert(error);
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const renderRegistrationFields = () => {
        switch(formData.role) {
            case '25-101': // Coordinator
                return (
                    <>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="department"
                            placeholder="Department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        />
                    </>
                );
            case '25-102': // Company
                return (
                    <>
                        <input
                            type="text"
                            name="companyName"
                            placeholder="Company Name"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="contactPerson"
                            placeholder="Contact Person"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="contactPhone"
                            placeholder="Contact Phone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            required
                        />
                    </>
                );
            case '25-103': // Student
                return (
                    <>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                        {/* CHANGED: Program as dropdown */}
                        <select
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Program</option>
                            {CIT_U_COURSES.map(course => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            name="yearLevel"
                            placeholder="Year Level"
                            value={formData.yearLevel}
                            onChange={handleChange}
                            required
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <select name="role" value={formData.role} onChange={handleChange} required>
                                <option value="25-103">Student</option>
                                <option value="25-102">Company</option>
                                <option value="25-101">Coordinator</option>
                            </select>
                            
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            
                            {renderRegistrationFields()}
                        </>
                    )}
                    
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                
                <p onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </p>
            </div>
        </div>
    );
};

export default Login;