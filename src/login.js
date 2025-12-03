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
        coordinatorName: '',
        coordinatorDepartment: '',
        studName: '',
        studYrLevel: '',
        contactPerson: '',
        contactPhone: '',
        course: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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

                console.log('Response status:', response.status);

                if (response.ok) {
                    try {
                        const text = await response.text();
                        console.log('Raw response:', text);
                        const data = JSON.parse(text);
                        console.log('Login response:', data);

                        // Extract user data based on role
                        let userData = {};
                        let userRole = data.role || '25-103';

                        if (userRole === '25-101') { // Coordinator
                            userData = {
                                id: data.id || data.user?.id,
                                username: data.username || data.user?.username,
                                email: data.email || data.user?.email,
                                coordinatorName: data.coordinatorName || data.user?.coordinatorName,
                                coordinatorDepartment: data.coordinatorDepartment || data.user?.coordinatorDepartment
                            };
                        } else if (userRole === '25-102') { // Company
                            userData = {
                                id: data.id || data.user?.id,
                                username: data.username || data.user?.username,
                                email: data.email || data.user?.email,
                                companyName: data.companyName || data.user?.companyName,
                                contactPerson: data.contactPerson || data.user?.contactPerson,
                                contactPhone: data.contactPhone || data.user?.contactPhone,
                                companyID: data.companyID || data.id
                            };
                        } else if (userRole === '25-103') { // Student
                            userData = {
                                id: data.id || data.user?.id,
                                username: data.username || data.user?.username,
                                email: data.email || data.user?.email,
                                studName: data.studName || data.user?.studName,
                                studYrLevel: data.studYrLevel || data.user?.studYrLevel,
                                course: data.course || data.user?.course || data.user?.studProgram,
                                studID: data.studID || data.id
                            };
                        }

                        onLogin(userRole, userData);
                    } catch (parseError) {
                        console.error('JSON parse error:', parseError);
                        setError('Invalid response from server');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Server error:', errorText);
                    setError(errorText || 'Invalid username or password');
                }
            } else {
                // Registration logic - same as before
                let endpoint = '';
                let userData = {};

                switch (formData.role) {
                    case '25-101': // Coordinator
                        endpoint = '/register/coordinator';
                        userData = {
                            username: formData.username,
                            email: formData.email,
                            coordinatorName: formData.coordinatorName,
                            coordinatorDepartment: formData.coordinatorDepartment
                        };
                        break;
                    case '25-102': // Company
                        endpoint = '/register/company';
                        userData = {
                            username: formData.username,
                            email: formData.email,
                            companyName: formData.companyName,
                            contactPerson: formData.contactPerson,
                            contactPhone: formData.contactPhone
                        };
                        break;
                    case '25-103': // Student
                        endpoint = '/register/student';
                        userData = {
                            username: formData.username,
                            email: formData.email,
                            studName: formData.studName,
                            studYrLevel: formData.studYrLevel,
                            course: formData.course
                        };
                        break;
                }

                console.log('Registering:', { endpoint, userData });

                const response = await fetch(`http://localhost:8080/api/auth${endpoint}?password=${formData.password}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });

                console.log('Registration response status:', response.status);

                if (response.ok) {
                    try {
                        const savedUser = await response.json();
                        console.log('Registration successful:', savedUser);
                        alert('Registration successful! Please login.');
                        setIsLogin(true);
                        // Reset form
                        setFormData({
                            username: '',
                            password: '',
                            email: '',
                            role: '25-103',
                            companyName: '',
                            coordinatorName: '',
                            coordinatorDepartment: '',
                            studName: '',
                            studYrLevel: '',
                            contactPerson: '',
                            contactPhone: '',
                            course: '',
                        });
                    } catch (parseError) {
                        console.error('Registration parse error:', parseError);
                        setError('Registration successful but server response was invalid');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Registration error:', errorText);
                    setError(errorText || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setError('An error occurred. Please try again.');
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
        switch (formData.role) {
            // In Login.js, inside the renderRegistrationFields() function
            case '25-101': // Coordinator
                return (
                    <>
                        <input
                            type="text"
                            name="coordinatorName"
                            placeholder="Coordinator Name"
                            value={formData.coordinatorName}
                            onChange={handleChange}
                            required
                        />

                        {/* Replace text input with dropdown */}
                        <select
                            name="coordinatorDepartment"
                            value={formData.coordinatorDepartment}
                            onChange={handleChange}
                            required
                            style={{
                                padding: '12px',
                                margin: '10px 0',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                width: '100%',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">Select Department</option>
                            <option value="CEA">CEA - College of Engineering and Architecture</option>
                            <option value="CCS">CCS - College of Computer Studies</option>
                            <option value="CASE">CASE - College of Arts, Sciences, and Education</option>
                            <option value="CMBA">CMBA - College of Management, Business and Accountancy</option>
                            <option value="CNAHS">CNAHS - College of Nursing and Allied Health Sciences</option>
                            <option value="CCJ">CCJ - College of Criminal Justice</option>
                        </select>
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
                        />
                    </>
                );
            case '25-103': // Student
                return (
                    <>
                        <input
                            type="text"
                            name="studName"
                            placeholder="Full Name"
                            value={formData.studName}
                            onChange={handleChange}
                            required
                        />
                        <select
                            name="course"
                            value={formData.course}
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
                            name="studYrLevel"
                            placeholder="Year Level"
                            value={formData.studYrLevel}
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
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
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

                <p onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                }} className="toggle-link">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </p>
            </div>
        </div>
    );
};

export default Login;