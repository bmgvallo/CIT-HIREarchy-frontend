// Student.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Profile from './Profile'; 

// Main Dashboard Component
function StudentDashboard() {
  const navigate = useNavigate();

  // State management for student
  const [student, setStudent] = useState({
    studName: 'John Michael Santos',
    studEmail: 'john.santos@student.edu',
    studProgram: 'Computer Science',
    studYrLevel: '3rd Year',
    resumeURL: '',
    studGPA: 3.75
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    jobId: '',
    coverLetter: '',
    resume: '',
    additionalInfo: ''
  });

  // Stats - UPDATED: Changed labels as requested
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  // Fetch initial data
  useEffect(() => {
    fetchApplications();
    fetchNotifications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Mock data - replace with actual API call
      const mockApplications = [
        {
          id: 1,
          jobTitle: 'Software Engineering Intern',
          company: 'TechCorp Philippines',
          location: 'Makati, Metro Manila',
          appliedDate: '2024-01-15',
          status: 'pending',
          salary: 25000,
          type: 'Internship'
        },
        {
          id: 2,
          jobTitle: 'Frontend Developer',
          company: 'WebSolutions Inc',
          location: 'Taguig, Metro Manila',
          appliedDate: '2024-01-10',
          status: 'approved',
          salary: 35000,
          type: 'Full-time'
        },
        {
          id: 3,
          jobTitle: 'Data Analyst Trainee',
          company: 'DataSystems Co',
          location: 'Quezon City',
          appliedDate: '2024-01-05',
          status: 'rejected',
          salary: 28000,
          type: 'Full-time'
        }
      ];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          message: 'Your application for Software Engineer at TechCorp has been viewed',
          type: 'application',
          is_read: false,
          created_at: '2 hours ago'
        },
        {
          id: 2,
          message: 'New job matching your profile: Backend Developer at StartupXYZ',
          type: 'recommendation',
          is_read: true,
          created_at: '1 day ago'
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Modal handlers
  const openModal = (job) => {
    setApplicationForm({
      jobId: job?.id || '',
      coverLetter: '',
      resume: student.resumeURL,
      additionalInfo: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setApplicationForm({
      jobId: '',
      coverLetter: '',
      resume: '',
      additionalInfo: ''
    });
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      // Submit application logic here
      console.log('Submitting application:', applicationForm);
      closeModal();
      showNotification('Application submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting application:', error);
      showNotification('Error submitting application', 'error');
    }
  };

  // Notification handlers
  const markAsRead = async (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  // Application actions
  const withdrawApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        showNotification('Application withdrawn successfully', 'success');
      } catch (error) {
        console.error('Error withdrawing application:', error);
        showNotification('Error withdrawing application', 'error');
      }
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(application => {
    if (activeFilter === 'all') return true;
    return application.status === activeFilter;
  });

  // Utility functions
  const showNotification = (message, type) => {
    console.log(`${type}: ${message}`);
  };

  const getInitials = () => {
    return student.studName.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(salary);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'active';
      case 'pending': return 'draft';
      case 'rejected': return 'closed';
      default: return 'draft';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
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
            {/* Notifications */}
            <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="far fa-bell"></i>
              {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
            </div>

            {showNotifications && (
              <div className="notifications-dropdown active">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && <span className="unread-count">{unreadCount} unread</span>}
                </div>

                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${!notification.is_read ? 'unread' : ''}`}>
                        <div className="notification-type-icon">
                          {notification.type === 'application' ? '📄'
                            : notification.type === 'recommendation' ? '✅'
                              : '🔔'}
                        </div>
                        <div className="notification-content">
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.created_at}</div>
                        </div>
                        {!notification.is_read && (
                          <button className="mark-read-btn" onClick={() => markAsRead(notification.id)} title="Mark as read">
                            ×
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notifications-footer">
                    <button className="mark-all-read" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown */}
            <div className="user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <div>{student.studName}</div>
              <div className="user-avatar">
                {getInitials()}
              </div>
              {showUserDropdown && (
                <div className="user-dropdown active">
                  <div className="user-dropdown-item" onClick={() => navigate('/student/profile')}>
                    <i className="fas fa-user-circle"></i> My Profile
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-file-alt"></i> My Resume
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-cog"></i> Settings
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item">
                    <button onClick={() => {/* Logout logic */ }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <main>
          <div className="dashboard-header">
            <div className="dashboard-title-section">
              <h1 className="dashboard-title">My Applications</h1>
              <p className="dashboard-subtitle">Track your job applications and internship opportunities</p>
            </div>
          </div>

          {/* Student Stats - UPDATED: Removed GPA, added Rejected */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{totalApplications}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{pendingApplications}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{approvedApplications}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{rejectedApplications}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-section">
            <div
              className={`filter-item ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({totalApplications})
            </div>
            <div
              className={`filter-item ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              Under Review ({pendingApplications})
            </div>
            <div
              className={`filter-item ${activeFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('approved')}
            >
              Approved ({approvedApplications})
            </div>
            <div
              className={`filter-item ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Not Selected ({rejectedApplications})
            </div>
          </div>

          <div className="divider"></div>

          {/* Applications Grid */}
          <div className="properties-container">
            {filteredApplications.length > 0 ? (
              filteredApplications.map(application => (
                <div key={application.id} className="property-card">
                  <div className="property-content">
                    <div className="job-header">
                      <h3 className="property-title">{application.jobTitle}</h3>
                      <div className={`property-status-badge ${getStatusBadgeClass(application.status)}`}>
                        {getStatusText(application.status)}
                      </div>
                    </div>
                    <div className="property-location">
                      <i className="fas fa-building"></i> {application.company} • {application.location}
                    </div>
                    <div className="property-details">
                      <span>Applied: {formatDate(application.appliedDate)}</span> •
                      <span> Type: {application.type}</span>
                    </div>
                    <div className="job-description">
                      <strong>Position:</strong> {application.jobTitle}<br />
                      <strong>Company:</strong> {application.company}<br />
                      <strong>Location:</strong> {application.location}
                    </div>
                    <div className="property-price">
                      {formatSalary(application.salary)}
                      <span className="price-period">/month</span>
                    </div>

                    <div className="property-actions">
                      <button className="btn-edit" onClick={() => openModal(application)}>
                        <i className="fas fa-eye"></i> View Details
                      </button>
                      <button className="btn-delete" onClick={() => withdrawApplication(application.id)}>
                        <i className="fas fa-times"></i> Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-properties">
                <p>No applications yet. Click "Browse Jobs" to start applying!</p>
              </div>
            )}
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

      {/* Application Modal */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <form onSubmit={handleSubmitApplication}>
              <div className="modal-header">
                <h2 className="modal-title">Job Application</h2>
                <button type="button" className="close-modal" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-subtitle">Submit your application for this position</div>

                {/* Application Details */}
                <div className="form-section">
                  <h3 className="section-title">Application Details</h3>

                  <div className="form-group">
                    <label className="form-label">Cover Letter</label>
                    <textarea
                      name="coverLetter"
                      value={applicationForm.coverLetter}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="6"
                      placeholder="Tell the employer why you are interested in this position and why you would be a good fit..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resume</label>
                    <select
                      name="resume"
                      value={applicationForm.resume}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select a resume</option>
                      <option value="resume1">John_Santos_Resume.pdf</option>
                      <option value="resume2">John_Santos_Updated_Resume.pdf</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Information</label>
                    <textarea
                      name="additionalInfo"
                      value={applicationForm.additionalInfo}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="3"
                      placeholder="Any additional information you'd like to share with the employer..."
                    />
                  </div>
                </div>

                {/* Student Information Preview */}
                <div className="form-section">
                  <h3 className="section-title">Your Information</h3>
                  <div className="stat-card">
                    <div className="form-row">
                      <div className="half-width">
                        <strong>Name:</strong> {student.studName}
                      </div>
                      <div className="half-width">
                        <strong>Program:</strong> {student.studProgram}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="half-width">
                        <strong>Year Level:</strong> {student.studYrLevel}
                      </div>
                      <div className="half-width">
                        <strong>GPA:</strong> {student.studGPA}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="half-width">
                        <strong>Email:</strong> {student.studEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Application</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;