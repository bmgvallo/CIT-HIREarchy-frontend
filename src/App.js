import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// CIT-U Courses Constants
const CIT_U_COURSES = {
  CEA: [
    'BS Architecture',
    'BS Chemical Engineering',
    'BS Civil Engineering',
    'BS Computer Engineering',
    'BS Electrical Engineering',
    'BS Electronics Engineering',
    'BS Industrial Engineering',
    'BS Mechanical Engineering',
    'BS Mining Engineering'
  ],
  CMBA: [
    'BS Accountancy',
    'BS Accounting Information Systems',
    'BS Management Accounting',
    'BS Business Administration',
    'BS Hospitality Management',
    'BS Tourism Management',
    'BS Office Administration',
    'Bachelor in Public Administration'
  ],
  CASE: [
    'AB Communication',
    'AB English with Applied Linguistics',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education',
    'Bachelor of Multimedia Arts',
    'BS Biology',
    'BS Math with Applied Industrial Mathematics',
    'BS Psychology'
  ],
  CNAHS: [
    'BS Nursing',
    'BS Pharmacy',
    'BS Medical Technology'
  ],
  CCS: [
    'BS Information Technology',
    'BS Computer Science'
  ],
  CCJ: [
    'BS Criminology'
  ]
};

// Flattened course list for dropdowns
const ALL_COURSES = Object.values(CIT_U_COURSES).flat();

function App() {
  // State management - UPDATED
  const [user, setUser] = useState({
    username: '',
    company_name: '',
    contact_person: '',
    email: '',
    id: null
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
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
    // CHANGED: Now using array for selected courses
    selectedCourses: [] // Array to store selected course names
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

  // Filter jobs based on active filter
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'approved') return job.status === 'approved';
    if (activeFilter === 'pending') return job.status === 'pending';
    if (activeFilter === 'rejected') return job.status === 'rejected';
    return true;
  });

  // ADDED: Function to fetch company data with useCallback
  const fetchCompanyData = useCallback(async () => {
    try {
      // Get user data from localStorage (set during login)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Using user data from localStorage:', userData);
        
        // If we have a company ID, fetch the full company details
        setUser({
        username: userData.username || 'Username',
        company_name: userData.companyName || userData.company_name || 'Company Name',
        contact_person: userData.contactPerson || userData.contact_person || 'Contact Person',
        email: userData.email || 'Email',
        id: userData.id
      });
    }
  } catch (error) {
    console.error('Error setting user data:', error);
  }
}, []);

  // UPDATED: fetchJobs with useCallback
  const fetchJobs = useCallback(async () => {
    try {
      const companyId = user?.id;
      
      if (!companyId) {
        console.log('No company ID found, skipping job fetch');
        return;
      }
      
      console.log('Fetching jobs for company:', companyId);
      
      const response = await fetch(`http://localhost:8080/api/listings/company/${companyId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Jobs fetched:', data);
        console.log('Number of jobs:', data.length);
        console.log('Job IDs:', data.map(job => job.listingID));
        setJobs(data);
      } else {
        console.error('Failed to fetch jobs, status:', response.status);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  }, [user?.id]);

  // UPDATED: fetchNotifications with useCallback
  const fetchNotifications = useCallback(async () => {
    try {
      // For now, use mock notifications since you don't have a notifications API
      const mockNotifications = [
        {
          id: 1,
          message: 'New application received for Software Engineer position',
          notification_type: 'application',
          is_read: false,
          created_at: '2 hours ago'
        },
        {
          id: 2,
          message: 'Job listing "Marketing Manager" has been approved',
          notification_type: 'approval',
          is_read: true,
          created_at: '1 day ago'
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(1); // One unread notification
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  // Fetch initial data - FIXED with dependencies
  useEffect(() => {
    fetchCompanyData();
    fetchJobs();
    fetchNotifications();
  }, [fetchCompanyData, fetchJobs, fetchNotifications]);

  // Modal handlers
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setEditingJobId(null); // Reset editing state
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
      selectedCourses: [] // Reset selected courses
    });
  };

  // CHANGED: Form handlers for course selection
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // NEW: Handle course selection
  const handleCourseSelection = (course) => {
    setFormData(prev => {
      const isSelected = prev.selectedCourses.includes(course);
      if (isSelected) {
        // Remove course if already selected
        return {
          ...prev,
          selectedCourses: prev.selectedCourses.filter(c => c !== course)
        };
      } else {
        // Add course if not selected
        return {
          ...prev,
          selectedCourses: [...prev.selectedCourses, course]
        };
      }
    });
  };

  // NEW: Select all courses in a department
  const selectAllCoursesInDepartment = (department) => {
    const departmentCourses = CIT_U_COURSES[department.toUpperCase()] || [];
    setFormData(prev => {
      const currentCourses = new Set(prev.selectedCourses);
      departmentCourses.forEach(course => currentCourses.add(course));
      return {
        ...prev,
        selectedCourses: Array.from(currentCourses)
      };
    });
  };

  // NEW: Deselect all courses in a department
  const deselectAllCoursesInDepartment = (department) => {
    const departmentCourses = CIT_U_COURSES[department.toUpperCase()] || [];
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.filter(course => !departmentCourses.includes(course))
    }));
  };

  // UPDATED: handleSubmit to include courses array
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get company ID from user data
      const companyId = user?.id;
      
      if (!companyId) {
        showNotification('Company information not found. Please log in again.', 'error');
        return;
      }

      // UPDATED: Include courses array in job data
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        modality: formData.modality,
        requirements: formData.requirements,
        postDate: formData.postDate || new Date().toISOString().split('T')[0],
        duration: formData.duration,
        deadline: formData.deadline,
        salary: parseFloat(formData.salary),
        status: "pending",
        courses: formData.selectedCourses // CHANGED: Send courses array
      };

      console.log('Job data to save:', jobData);

      let response;
      let savedJob;
      
      if (editingJobId) {
        // UPDATE existing job
        console.log('Updating job ID:', editingJobId);
        response = await fetch(`http://localhost:8080/api/listings/${editingJobId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
          savedJob = await response.json();
          console.log('Job updated successfully:', savedJob);
          
          // UPDATE LOCAL STATE - MAKE SURE TO KEEP THE ID
          setJobs(prev => prev.map(job => {
            if (job.listingID === editingJobId) {
              return {
                ...savedJob, // Use the returned job data
                listingID: editingJobId // Keep the original ID
              };
            }
            return job;
          }));
          
          closeModal();
          showNotification('Job listing updated successfully!', 'success');
        } else {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          showNotification('Error updating job listing: ' + errorText, 'error');
        }
      } else {
        // CREATE new job - include company for creation only
        console.log('Creating new job');
        const createData = {
          ...jobData,
          company: { id: companyId } // Only include company for creation
        };
        response = await fetch('http://localhost:8080/api/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData)
        });
        
        if (response.ok) {
          savedJob = await response.json();
          console.log('Job created successfully:', savedJob);
          
          // ADD TO LOCAL STATE
          setJobs(prev => [...prev, savedJob]);
          
          closeModal();
          showNotification('Job listing created successfully!', 'success');
        } else {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          showNotification('Error creating job listing: ' + errorText, 'error');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      showNotification(`Error ${editingJobId ? 'updating' : 'creating'} job listing: ` + error.message, 'error');
    }
  };

  // Replace the deleteJob function
  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/listings/${jobId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setJobs(prev => prev.filter(j => j.listingID !== jobId));
          showNotification('Job listing deleted successfully', 'success');
        } else {
          showNotification('Error deleting job listing', 'error');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Error deleting job listing', 'error');
      }
    }
  };

  // UPDATED: editJob to handle courses array
  const editJob = (job) => {
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      modality: job.modality || '',
      requirements: job.requirements || '',
      postDate: job.postDate || '',
      duration: job.duration || '',
      deadline: job.deadline || '',
      salary: job.salary || '',
      selectedCourses: job.courses || [] // CHANGED: Set selected courses from job data
    });
    setEditingJobId(job.listingID || job.id);
    setShowModal(true);
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

  // ADD LOGOUT FUNCTION
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Show logout notification
    showNotification('Logged out successfully', 'success');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  // Utility functions
  const showNotification = (message, type) => {
    // Implement your notification system here
    console.log(`${type}: ${message}`);
  };

  // UPDATED: getInitials to use contact person name
  const getInitials = () => {
    if (user.contact_person && user.contact_person.trim()) {
      const names = user.contact_person.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.contact_person[0].toUpperCase();
    }
    if (user.company_name && user.company_name.trim()) {
      return user.company_name[0].toUpperCase();
    }
    if (user.username && user.username.trim()) {
      return user.username[0].toUpperCase();
    }
    return 'C'; // Default fallback
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

  // NEW: Check if all courses in department are selected
  const isAllCoursesSelected = (department) => {
    const departmentCourses = CIT_U_COURSES[department.toUpperCase()] || [];
    return departmentCourses.length > 0 && 
           departmentCourses.every(course => formData.selectedCourses.includes(course));
  };

  // NEW: Check if any course in department is selected
  const isAnyCourseSelected = (department) => {
    const departmentCourses = CIT_U_COURSES[department.toUpperCase()] || [];
    return departmentCourses.some(course => formData.selectedCourses.includes(course));
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

            {/* User Dropdown - UPDATED */}
            <div className="user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <div>
                {user.contact_person || user.company_name || user.username || 'User'}
                {user.company_name && user.company_name !== (user.contact_person || user.username) && (
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    {user.company_name}
                  </div>
                )}
              </div>
              <div className="user-avatar">
                {getInitials()}
              </div>
              {showUserDropdown && (
                <div className="user-dropdown active">
                  <div className="user-dropdown-item">
                    <i className="fas fa-building"></i> {user.company_name || 'Company'}
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-user"></i> {user.contact_person || 'Contact Person'}
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-envelope"></i> {user.email || 'Email'}
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-cog"></i> Settings
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item">
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
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
                <div key={job.listingID || job.id} className="property-card" data-status={job.status}>
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
                    {/* NEW: Display targeted courses */}
                    {job.courses && job.courses.length > 0 && (
                      <div className="targeted-courses">
                        <strong>Targeted Courses:</strong> {job.courses.join(', ')}
                      </div>
                    )}
                    <div className="job-description">
                      {job.description}
                    </div>
                    <div className="property-price">{formatSalary(job.salary)}<span className="price-period">/month</span></div>
                    
                    <div className="property-actions">
                      <button className="btn-edit" onClick={() => editJob(job)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-delete" onClick={() => deleteJob(job.listingID || job.id)}>
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
                <li><a href="/about">About Us</a></li>
                <li><a href="/how-it-works">How It Works</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/faq">FAQs</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
                <li><a href="/guidelines">Recruitment Guidelines</a></li>
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
                <h2 className="modal-title">
                  {editingJobId ? 'Edit Job Listing' : 'Create New Job Listing'}
                </h2>
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
                
                {/* Target Departments & Programs - UPDATED */}
                <div className="amenities-section">
                  <h3 className="section-title">Target Departments & Programs</h3>
                  <div className="selected-courses-preview">
                    <strong>Selected Courses ({formData.selectedCourses.length}):</strong>
                    {formData.selectedCourses.length > 0 ? (
                      <div className="selected-courses-list">
                        {formData.selectedCourses.map(course => (
                          <span key={course} className="selected-course-tag">
                            {course}
                            <button 
                              type="button"
                              onClick={() => handleCourseSelection(course)}
                              className="remove-course-btn"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>No courses selected</span>
                    )}
                  </div>
                  
                  {/* College of Engineering and Architecture (CEA) */}
                  <div className={`amenity-group ${activeDepartmentGroups.cea ? 'active' : ''}`}>
                    <div className="amenity-header" onClick={() => toggleDepartmentGroup('cea')}>
                      <div className="amenity-title">
                        <i className="fas fa-cogs amenity-icon"></i>
                        <span>College of Engineering and Architecture (CEA)</span>
                      </div>
                      <div className="department-actions">
                        <button 
                          type="button"
                          className="select-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAllCoursesSelected('CEA')) {
                              deselectAllCoursesInDepartment('CEA');
                            } else {
                              selectAllCoursesInDepartment('CEA');
                            }
                          }}
                        >
                          {isAllCoursesSelected('CEA') ? 'Deselect All' : 'Select All'}
                        </button>
                        <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.cea ? 'rotated' : ''}`}></i>
                      </div>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {CIT_U_COURSES.CEA.map(course => (
                          <div key={course} className="amenity-item">
                            <input
                              type="checkbox"
                              id={course.replace(/\s+/g, '_')}
                              checked={formData.selectedCourses.includes(course)}
                              onChange={() => handleCourseSelection(course)}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={course.replace(/\s+/g, '_')} className="amenity-label">
                              {course}
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
                      <div className="department-actions">
                        <button 
                          type="button"
                          className="select-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAllCoursesSelected('CCS')) {
                              deselectAllCoursesInDepartment('CCS');
                            } else {
                              selectAllCoursesInDepartment('CCS');
                            }
                          }}
                        >
                          {isAllCoursesSelected('CCS') ? 'Deselect All' : 'Select All'}
                        </button>
                        <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.ccs ? 'rotated' : ''}`}></i>
                      </div>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {CIT_U_COURSES.CCS.map(course => (
                          <div key={course} className="amenity-item">
                            <input
                              type="checkbox"
                              id={course.replace(/\s+/g, '_')}
                              checked={formData.selectedCourses.includes(course)}
                              onChange={() => handleCourseSelection(course)}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={course.replace(/\s+/g, '_')} className="amenity-label">
                              {course}
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
                      <div className="department-actions">
                        <button 
                          type="button"
                          className="select-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAllCoursesSelected('CASE')) {
                              deselectAllCoursesInDepartment('CASE');
                            } else {
                              selectAllCoursesInDepartment('CASE');
                            }
                          }}
                        >
                          {isAllCoursesSelected('CASE') ? 'Deselect All' : 'Select All'}
                        </button>
                        <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.case ? 'rotated' : ''}`}></i>
                      </div>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {CIT_U_COURSES.CASE.map(course => (
                          <div key={course} className="amenity-item">
                            <input
                              type="checkbox"
                              id={course.replace(/\s+/g, '_')}
                              checked={formData.selectedCourses.includes(course)}
                              onChange={() => handleCourseSelection(course)}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={course.replace(/\s+/g, '_')} className="amenity-label">
                              {course}
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
                      <div className="department-actions">
                        <button 
                          type="button"
                          className="select-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAllCoursesSelected('CMBA')) {
                              deselectAllCoursesInDepartment('CMBA');
                            } else {
                              selectAllCoursesInDepartment('CMBA');
                            }
                          }}
                        >
                          {isAllCoursesSelected('CMBA') ? 'Deselect All' : 'Select All'}
                        </button>
                        <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.cmba ? 'rotated' : ''}`}></i>
                      </div>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-grid">
                        {CIT_U_COURSES.CMBA.map(course => (
                          <div key={course} className="amenity-item">
                            <input
                              type="checkbox"
                              id={course.replace(/\s+/g, '_')}
                              checked={formData.selectedCourses.includes(course)}
                              onChange={() => handleCourseSelection(course)}
                              className="amenity-checkbox"
                            />
                            <label htmlFor={course.replace(/\s+/g, '_')} className="amenity-label">
                              {course}
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
                      <div className="department-actions">
                        <button 
                          type="button"
                          className="select-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAllCoursesSelected('CNAHS')) {
                              deselectAllCoursesInDepartment('CNAHS');
                            } else {
                              selectAllCoursesInDepartment('CNAHS');
                            }
                          }}
                        >
                          {isAllCoursesSelected('CNAHS') ? 'Deselect All' : 'Select All'}
                        </button>
                        <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.cnahs ? 'rotated' : ''}`}></i>
                      </div>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-item">
                        <input
                          type="checkbox"
                          id="nursing"
                          checked={formData.selectedCourses.includes('Nursing')}
                          onChange={() => handleCourseSelection('Nursing')}
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
                      <div className="department-actions">
                        <button 
                          type="button"
                          className="select-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAllCoursesSelected('CCJ')) {
                              deselectAllCoursesInDepartment('CCJ');
                            } else {
                              selectAllCoursesInDepartment('CCJ');
                            }
                          }}
                        >
                          {isAllCoursesSelected('CCJ') ? 'Deselect All' : 'Select All'}
                        </button>
                        <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups.ccj ? 'rotated' : ''}`}></i>
                      </div>
                    </div>
                    <div className="amenity-content">
                      <div className="amenity-item">
                        <input
                          type="checkbox"
                          id="criminology"
                          checked={formData.selectedCourses.includes('Criminology')}
                          onChange={() => handleCourseSelection('Criminology')}
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
                  <button type="submit" className="btn btn-primary">
                    {editingJobId ? 'Update Job Listing' : 'Create Job Listing'}
                  </button>
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