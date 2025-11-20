import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State management
  const [user, setUser] = useState({
    username: 'company_admin',
    first_name: 'Company',
    last_name: 'Admin'
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    modality: '',
    requirements: '',
    postDate: '',
    duration: '',
    deadline: '',
    salary: '',
    // CEA Programs
    civil_engineering: false,
    chemical_engineering: false,
    computer_engineering: false,
    electrical_engineering: false,
    mechanical_engineering: false,
    architecture: false,
    // CCS Programs
    computer_science: false,
    information_technology: false,
    // CASE Programs
    communication: false,
    biology: false,
    psychology: false,
    education: false,
    // CMBA Programs
    accountancy: false,
    business_admin: false,
    hospitality_management: false,
    // CNAHS Programs
    nursing: false,
    // CCJ Programs
    criminology: false
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDepartmentGroups, setActiveDepartmentGroups] = useState({
    cea: true,
    ccs: true,
    case: true,
    cmba: true,
    cnahs: true,
    ccj: true
  });

  // Stats
  const totalJobs = jobs.length;
  const approvedJobs = jobs.filter(j => j.status === 'approved').length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const rejectedJobs = jobs.filter(j => j.status === 'rejected').length;

  // Fetch initial data
  useEffect(() => {
    fetchJobs();
    fetchNotifications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Modal handlers
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      location: '',
      modality: '',
      requirements: '',
      postDate: '',
      duration: '',
      deadline: '',
      salary: '',
      civil_engineering: false,
      chemical_engineering: false,
      computer_engineering: false,
      electrical_engineering: false,
      mechanical_engineering: false,
      architecture: false,
      computer_science: false,
      information_technology: false,
      communication: false,
      biology: false,
      psychology: false,
      education: false,
      accountancy: false,
      business_admin: false,
      hospitality_management: false,
      nursing: false,
      criminology: false
    });
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        closeModal();
        fetchJobs(); // Refresh the list
        showNotification('Job listing created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showNotification('Error creating job listing', 'error');
    }
  };

  // Notification handlers
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Job actions
  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        await fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE'
        });
        setJobs(prev => prev.filter(j => j.id !== jobId));
        showNotification('Job listing deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Error deleting job listing', 'error');
      }
    }
  };

  const editJob = (job) => {
    setFormData({
      ...formData,
      ...job
    });
    setShowModal(true);
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'approved') return job.status === 'approved';
    if (activeFilter === 'pending') return job.status === 'pending';
    if (activeFilter === 'rejected') return job.status === 'rejected';
    return true;
  });

  // Utility functions
  const showNotification = (message, type) => {
    // Implement your notification system here
    console.log(`${type}: ${message}`);
  };

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const toggleDepartmentGroup = (group) => {
    setActiveDepartmentGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
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
                          {notification.notification_type === 'application' ? '📄'
                            : notification.notification_type === 'approval' ? '✅'
                            : notification.notification_type === 'rejection' ? '❌'
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
              <div>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}</div>
              <div className="user-avatar">
                {getInitials()}
              </div>
              {showUserDropdown && (
                <div className="user-dropdown active">
                  <div className="user-dropdown-item">
                    <i className="fas fa-user-circle"></i> Company Profile
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-cog"></i> Settings
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item">
                    <button onClick={() => {/* Logout logic */}} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
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
              <h1 className="dashboard-title">Job Listings</h1>
              <p className="dashboard-subtitle">Manage your company's job postings</p>
            </div>
            <div className="add-property-container" onClick={openModal}>
              <span className="add-property-text">Create New Job</span>
              <div className="add-property-icon">
                <i className="fas fa-plus"></i>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{totalJobs}</div>
              <div className="stat-label">Total Listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{approvedJobs}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{pendingJobs}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{rejectedJobs}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="filter-section">
            <div 
              className={`filter-item ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({totalJobs})
            </div>
            <div 
              className={`filter-item ${activeFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('approved')}
            >
              Approved ({approvedJobs})
            </div>
            <div 
              className={`filter-item ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              Pending ({pendingJobs})
            </div>
            <div 
              className={`filter-item ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected ({rejectedJobs})
            </div>
          </div>
          
          <div className="divider"></div>
          
          {/* Jobs Grid */}
          <div className="properties-container">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job.id} className="property-card" data-status={job.status}>
                  <div className="property-content">
                    <div className="job-header">
                      <h3 className="property-title">{job.title}</h3>
                      <div className={`property-status-badge ${job.status}`}>
                        {job.status}
                      </div>
                    </div>
                    <div className="property-location">
                      <i className="fas fa-map-marker-alt"></i> {job.location} • {job.modality}
                    </div>
                    <div className="property-details">
                      <span>Posted: {formatDate(job.postDate)}</span> • 
                      <span> Deadline: {formatDate(job.deadline)}</span> • 
                      <span> Duration: {job.duration}</span>
                    </div>
                    <div className="job-description">
                      {job.description}
                    </div>
                    <div className="property-price">{formatSalary(job.salary)}<span className="price-period">/month</span></div>
                    
                    <div className="property-actions">
                      <button className="btn-edit" onClick={() => editJob(job)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-delete" onClick={() => deleteJob(job.id)}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-properties">
                <p>No job listings yet. Click "Create New Job" to get started!</p>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h3>HIREarchy</h3>
              <p>Your trusted platform for connecting companies with qualified candidates from top educational institutions.</p>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">FAQs</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Recruitment Guidelines</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Contact Us</h3>
              <div className="contact-info">
                <a href="mailto:support@hirearchy.com">
                  <i className="fas fa-envelope"></i> support@hirearchy.com
                </a>
                <a href="tel:1-800-HIRE-NOW">
                  <i className="fas fa-phone"></i> 1-800-HIRE-NOW
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Job Listing</h2>
                <button type="button" className="close-modal" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal-body">
                <div className="modal-subtitle">Fill in the details below to create a new job listing</div>

                {/* Job Details */}
                <div className="form-section">
                  <h3 className="section-title">Job Details</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., Software Engineer, Marketing Manager"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Job Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="4"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half-width">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Manila, Remote, Hybrid"
                        required
                      />
                    </div>
                    
                    <div className="form-group half-width">
                      <label className="form-label">Work Modality</label>
                      <select
                        name="modality"
                        value={formData.modality}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select modality</option>
                        <option value="On-site">On-site</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half-width">
                      <label className="form-label">Post Date</label>
                      <input
                        type="date"
                        name="postDate"
                        value={formData.postDate}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group half-width">
                      <label className="form-label">Application Deadline</label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half-width">
                      <label className="form-label">Employment Duration</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select duration</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    
                    <div className="form-group half-width">
                      <label className="form-label">Monthly Salary (₱)</label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 50000"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requirements</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="3"
                      placeholder="List the required qualifications, skills, and experience..."
                      required
                    />
                  </div>
                </div>
                
                {/* Target Departments & Programs */}
                <div className="amenities-section">
                  <h3 className="section-title">Target Departments & Programs</h3>
                  
                  {/* College of Engineering and Architecture (CEA) */}
                  <div className={`amenity-group ${activeDepartmentGroups.cea ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('cea')}>
                      <div className="amenity-title">
                        <i className="fas fa-cogs amenity-icon"></i>
                        <span>College of Engineering and Architecture (CEA)</span>
                      </div>
                      <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.cea ? 'rotated' : ''}`}></i>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {[
                          'civil_engineering', 'chemical_engineering', 'computer_engineering',
                          'electrical_engineering', 'mechanical_engineering', 'architecture'
                        ].map(program => (
                          <div key={program} className="amenity-item">
                            <input
                              type="checkbox"
                              id={program}
                              name={program}
                              checked={formData[program]}
                              onChange={handleInputChange}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={program} className="amenity-label">
                              {program.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* College of Computer Studies (CCS) */}
                  <div className={`amenity-group ${activeDepartmentGroups.ccs ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('ccs')}>
                      <div className="amenity-title">
                        <i className="fas fa-laptop-code amenity-icon"></i>
                        <span>College of Computer Studies (CCS)</span>
                      </div>
                      <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.ccs ? 'rotated' : ''}`}></i>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {['computer_science', 'information_technology'].map(program => (
                          <div key={program} className="amenity-item">
                            <input
                              type="checkbox"
                              id={program}
                              name={program}
                              checked={formData[program]}
                              onChange={handleInputChange}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={program} className="amenity-label">
                              {program.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* College of Arts, Sciences, and Education (CASE) */}
                  <div className={`amenity-group ${activeDepartmentGroups.case ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('case')}>
                      <div className="amenity-title">
                        <i className="fas fa-palette amenity-icon"></i>
                        <span>College of Arts, Sciences, and Education (CASE)</span>
                      </div>
                      <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.case ? 'rotated' : ''}`}></i>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {['communication', 'biology', 'psychology', 'education'].map(program => (
                          <div key={program} className="amenity-item">
                            <input
                              type="checkbox"
                              id={program}
                              name={program}
                              checked={formData[program]}
                              onChange={handleInputChange}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={program} className="amenity-label">
                              {program.charAt(0).toUpperCase() + program.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* College of Management, Business and Accountancy (CMBA) */}
                  <div className={`amenity-group ${activeDepartmentGroups.cmba ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('cmba')}>
                      <div className="amenity-title">
                        <i className="fas fa-chart-line amenity-icon"></i>
                        <span>College of Management, Business and Accountancy (CMBA)</span>
                      </div>
                      <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.cmba ? 'rotated' : ''}`}></i>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {['accountancy', 'business_admin', 'hospitality_management'].map(program => (
                          <div key={program} className="amenity-item">
                            <input
                              type="checkbox"
                              id={program}
                              name={program}
                              checked={formData[program]}
                              onChange={handleInputChange}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={program} className="amenity-label">
                              {program.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* College of Nursing and Allied Health Sciences (CNAHS) */}
                  <div className={`amenity-group ${activeDepartmentGroups.cnahs ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('cnahs')}>
                      <div className="amenity-title">
                        <i className="fas fa-heartbeat amenity-icon"></i>
                        <span>College of Nursing and Allied Health Sciences (CNAHS)</span>
                      </div>
                      <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.cnahs ? 'rotated' : ''}`}></i>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-item">
                        <input
                          type="checkbox"
                          id="nursing"
                          name="nursing"
                          checked={formData.nursing}
                          onChange={handleInputChange}
                          className="amenity-checkbox"
                        />
                        <label htmlFor="nursing" className="amenity-label">
                          Nursing
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* College of Criminal Justice (CCJ) */}
                  <div className={`amenity-group ${activeDepartmentGroups.ccj ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('ccj')}>
                      <div className="amenity-title">
                        <i className="fas fa-shield-alt amenity-icon"></i>
                        <span>College of Criminal Justice (CCJ)</span>
                      </div>
                      <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.ccj ? 'rotated' : ''}`}></i>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-item">
                        <input
                          type="checkbox"
                          id="criminology"
                          name="criminology"
                          checked={formData.criminology}
                          onChange={handleInputChange}
                          className="amenity-checkbox"
                        />
                        <label htmlFor="criminology" className="amenity-label">
                          Criminology
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                        
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Job Listing</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;