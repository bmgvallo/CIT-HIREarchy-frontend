// Profile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();

    const [student, setStudent] = useState({
        studName: 'John Michael Santos',
        studEmail: 'john.santos@student.edu',
        studProgram: 'Computer Science',
        studYrLevel: '3rd Year',
        resumeURL: 'John_Santos_Resume.pdf',
        studGPA: 3.75,
        phone: '+63 912 345 6789',
        address: 'Manila, Philippines',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        bio: 'A passionate Computer Science student with interest in web development and software engineering.'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(student);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        setStudent(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm(student);
        setIsEditing(false);
    };

    const getInitials = () => {
        return student.studName.split(' ').map(name => name[0]).join('').toUpperCase();
    };

    return (
        <div className="App">
            {/* Header */}
            <div className="header-container">
                <div className="header-content">
                    <div className="logo-section">
                        <h2>HIRE<span>archy</span></h2>
                    </div>

                    <div className="header-right">
                        <div className="user-info">
                            <div>{student.studName}</div>
                            <div className="user-avatar">
                                {getInitials()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                <main>
                    <div className="dashboard-header">
                        <div className="dashboard-title-section">
                            <h1 className="dashboard-title">My Profile</h1>
                            <p className="dashboard-subtitle">Manage your personal information and academic details</p>
                        </div>
                        <div className="add-property-container" onClick={() => navigate('/student')}>
                            <span className="add-property-text">Back to Dashboard</span>
                            <div className="add-property-icon">
                                <i className="fas fa-arrow-left"></i>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="stat-card" style={{ marginBottom: '30px' }}>
                        <div className="form-section">
                            <div className="section-title">
                                <i className="fas fa-user-graduate"></i>
                                <span>Student Information</span>
                                {!isEditing && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => setIsEditing(true)}
                                        style={{ marginLeft: 'auto', width: 'auto', padding: '8px 16px' }}
                                    >
                                        <i className="fas fa-edit"></i> Edit Profile
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div>
                                    <div className="form-row">
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="studName"
                                                    value={editForm.studName}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    name="studEmail"
                                                    value={editForm.studEmail}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Program</label>
                                                <select
                                                    name="studProgram"
                                                    value={editForm.studProgram}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                >
                                                    <option value="Computer Science">Computer Science</option>
                                                    <option value="Information Technology">Information Technology</option>
                                                    <option value="Computer Engineering">Computer Engineering</option>
                                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                    <option value="Civil Engineering">Civil Engineering</option>
                                                    <option value="Business Administration">Business Administration</option>
                                                    <option value="Accountancy">Accountancy</option>
                                                    <option value="Nursing">Nursing</option>
                                                    <option value="Psychology">Psychology</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Year Level</label>
                                                <select
                                                    name="studYrLevel"
                                                    value={editForm.studYrLevel}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                >
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                    <option value="5th Year">5th Year</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">GPA</label>
                                                <input
                                                    type="number"
                                                    name="studGPA"
                                                    value={editForm.studGPA}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    step="0.01"
                                                    min="1.00"
                                                    max="4.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={editForm.phone}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={editForm.address}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={editForm.bio}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="property-actions">
                                        <button className="btn-edit" onClick={handleSave}>
                                            <i className="fas fa-save"></i> Save Changes
                                        </button>
                                        <button className="btn-delete" onClick={handleCancel}>
                                            <i className="fas fa-times"></i> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="form-row">
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Full Name</label>
                                                <div className="form-input" style={{ backgroundColor: '#f8f9fa' }}>
                                                    {student.studName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <div className="form-input" style={{ backgroundColor: '#f8f9fa' }}>
                                                    {student.studEmail}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Program</label>
                                                <div className="form-input" style={{ backgroundColor: '#f8f9fa' }}>
                                                    {student.studProgram}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Year Level</label>
                                                <div className="form-input" style={{ backgroundColor: '#f8f9fa' }}>
                                                    {student.studYrLevel}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">GPA</label>
                                                <div className="form-input" style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', color: '#450000' }}>
                                                    {student.studGPA}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="half-width">
                                            <div className="form-group">
                                                <label className="form-label">Phone</label>
                                                <div className="form-input" style={{ backgroundColor: '#f8f9fa' }}>
                                                    {student.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <div className="form-input" style={{ backgroundColor: '#f8f9fa' }}>
                                            {student.address}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Bio</label>
                                        <div className="form-input" style={{ backgroundColor: '#f8f9fa', minHeight: '80px' }}>
                                            {student.bio}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Skills</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                            {student.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        backgroundColor: '#450000',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '16px',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Resume</label>
                                        <div className="form-input" style={{ backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{student.resumeURL}</span>
                                            <button className="btn-edit" style={{ width: 'auto', padding: '6px 12px' }}>
                                                <i className="fas fa-download"></i> Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer>
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>HIREarchy</h3>
                            <p>Your trusted platform for connecting students with internship and job opportunities from top companies.</p>
                        </div>

                        <div className="footer-section">
                            <h3>Student Resources</h3>
                            <ul className="footer-links">
                                <li><button className="footer-link">Career Guidance</button></li>
                                <li><button className="footer-link">Resume Builder</button></li>
                                <li><button className="footer-link">Interview Tips</button></li>
                                <li><button className="footer-link">Internship Programs</button></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3>Support</h3>
                            <ul className="footer-links">
                                <li><button className="footer-link">Help Center</button></li>
                                <li><button className="footer-link">Contact Career Services</button></li>
                                <li><button className="footer-link">FAQs</button></li>
                                <li><button className="footer-link">Technical Support</button></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3>Contact Us</h3>
                            <div className="contact-info">
                                <a href="mailto:careers@hirearchy.com">
                                    <i className="fas fa-envelope"></i> careers@hirearchy.com
                                </a>
                                <a href="tel:1-800-CAREERS">
                                    <i className="fas fa-phone"></i> 1-800-CAREERS
                                </a>
                                <div className="location">
                                    <i className="fas fa-map-marker-alt"></i> Manila, Philippines
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="copyright">
                        © 2025 HIREarchy. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default Profile;