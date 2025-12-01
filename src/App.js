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
//const ALL_COURSES = Object.values(CIT_U_COURSES).flat();

function App() {
  // State management
  const [user, setUser] = useState({
    username: '',
    companyName: '',
    contactPerson: '',
    email: '',
    id: null,
    companyID: null
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState(null);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationFeedback, setApplicationFeedback] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    modality: '',
    requirements: '',
    postDate: new Date().toISOString().split('T')[0],
    duration: '',
    deadline: '',
    salary: '',
    selectedCourses: []
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
  const [loading, setLoading] = useState(false);

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

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Company user data:', userData);

        setUser({
          username: userData.username || '',
          companyName: userData.companyName || '',
          contactPerson: userData.contactPerson || '',
          email: userData.email || '',
          id: userData.id,
          companyID: userData.companyID || userData.id
        });
      }
    } catch (error) {
      console.error('Error setting company data:', error);
    }
  }, []);

  // Fetch jobs for company
  const fetchJobs = useCallback(async () => {
    try {
      const companyId = user?.companyID || user?.id;

      if (!companyId) {
        console.log('No company ID found');
        return;
      }

      console.log('Fetching jobs for company ID:', companyId);

      const response = await fetch(`http://localhost:8080/api/listings/company/${companyId}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Jobs fetched:', data);
        setJobs(data);
      } else {
        console.error('Failed to fetch jobs:', response.status);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  }, [user?.companyID, user?.id]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
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
      setUnreadCount(1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
      fetchNotifications();
    }
  }, [user?.id, fetchJobs, fetchNotifications]);

  // Modal handlers
  const openModal = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      modality: '',
      requirements: '',
      postDate: new Date().toISOString().split('T')[0],
      duration: '',
      deadline: '',
      salary: '',
      selectedCourses: []
    });
    setEditingJobId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJobId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      modality: '',
      requirements: '',
      postDate: new Date().toISOString().split('T')[0],
      duration: '',
      deadline: '',
      salary: '',
      selectedCourses: []
    });
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSelection = (course) => {
    setFormData(prev => {
      const isSelected = prev.selectedCourses.includes(course);
      if (isSelected) {
        return {
          ...prev,
          selectedCourses: prev.selectedCourses.filter(c => c !== course)
        };
      } else {
        return {
          ...prev,
          selectedCourses: [...prev.selectedCourses, course]
        };
      }
    });
  };

  const viewJobApplications = async (job) => {
    try {
      setSelectedJobForApplications(job);

      // Fetch applications for this job
      const response = await fetch(`http://localhost:8080/api/applications/listing/${job.listingID}`);

      if (response.ok) {
        const applications = await response.json();
        setSelectedJobApplications(applications);
        setShowApplicationsModal(true);
      } else {
        showNotification('Failed to fetch applications', 'error');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showNotification('Error fetching applications', 'error');
    }
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setApplicationFeedback(application.feedback || '');
    setShowApplicationDetailsModal(true);
  };

  const updateApplicationStatus = async (status) => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`http://localhost:8080/api/applications/${selectedApplication.applicationID}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          feedback: applicationFeedback
        })
      });

      if (response.ok) {
        const updatedApplication = await response.json();

        // Update in local state
        setJobs(prev => prev.map(job => {
          if (job.listingID === selectedJobForApplications?.listingID && job.applications) {
            return {
              ...job,
              applications: job.applications.map(app =>
                app.applicationID === selectedApplication.applicationID
                  ? updatedApplication
                  : app
              )
            };
          }
          return job;
        }));

        showNotification(`Application ${status.toLowerCase()} successfully`, 'success');
        setShowApplicationDetailsModal(false);
      } else {
        showNotification('Failed to update application status', 'error');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      showNotification('Error updating application', 'error');
    }
  };
  const selectAllCoursesInDepartment = (department) => {
    const departmentCourses = CIT_U_COURSES[department] || [];
    setFormData(prev => {
      const currentCourses = new Set(prev.selectedCourses);
      departmentCourses.forEach(course => currentCourses.add(course));
      return {
        ...prev,
        selectedCourses: Array.from(currentCourses)
      };
    });
  };

  const deselectAllCoursesInDepartment = (department) => {
    const departmentCourses = CIT_U_COURSES[department] || [];
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.filter(course => !departmentCourses.includes(course))
    }));
  };

  // Handle job submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyId = user?.companyID || user?.id;

      if (!companyId) {
        showNotification('Company information not found. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      // Prepare job data according to your backend entity
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        modality: formData.modality,
        requirements: formData.requirements,
        postDate: formData.postDate,
        duration: formData.duration,
        deadline: formData.deadline,
        salary: parseFloat(formData.salary),
        status: "pending",
        courses: formData.selectedCourses,
        company: { id: companyId }
      };

      console.log('Submitting job data:', jobData);

      let response;

      if (editingJobId) {
        // Update existing job
        response = await fetch(`http://localhost:8080/api/listings/${editingJobId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData)
        });

        if (response.ok) {
          const savedJob = await response.json();
          setJobs(prev => prev.map(job =>
            job.listingID === editingJobId ? savedJob : job
          ));
          closeModal();
          showNotification('Job listing updated successfully!', 'success');
        } else {
          const errorText = await response.text();
          showNotification(`Error updating job: ${errorText}`, 'error');
        }
      } else {
        // Create new job
        response = await fetch('http://localhost:8080/api/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData)
        });

        if (response.ok) {
          const savedJob = await response.json();
          setJobs(prev => [...prev, savedJob]);
          closeModal();
          showNotification('Job listing created successfully!', 'success');
        } else {
          const errorText = await response.text();
          showNotification(`Error creating job: ${errorText}`, 'error');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      showNotification(`Error saving job: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete job
  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/listings/${jobId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setJobs(prev => prev.filter(j => j.listingID !== jobId));
          showNotification('Job listing deleted successfully', 'success');
        } else if (response.status === 404) {
          // If not found on server, remove from local state anyway
          setJobs(prev => prev.filter(j => j.listingID !== jobId));
          showNotification('Job listing removed', 'info');
        } else {
          const errorText = await response.text();
          showNotification(`Error: ${errorText}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Error deleting job listing', 'error');
      }
    }
  };

  // Edit job
  const editJob = (job) => {
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      modality: job.modality || '',
      requirements: job.requirements || '',
      postDate: job.postDate || new Date().toISOString().split('T')[0],
      duration: job.duration || '',
      deadline: job.deadline || '',
      salary: job.salary || '',
      selectedCourses: job.courses || []
    });
    setEditingJobId(job.listingID);
    setShowModal(true);
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

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  // Utility functions
  const showNotification = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const getInitials = () => {
    if (user.contactPerson && user.contactPerson.trim()) {
      const names = user.contactPerson.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.contactPerson[0].toUpperCase();
    }
    if (user.companyName && user.companyName.trim()) {
      return user.companyName[0].toUpperCase();
    }
    if (user.username && user.username.trim()) {
      return user.username[0].toUpperCase();
    }
    return 'C';
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
    }).format(salary || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isAllCoursesSelected = (department) => {
    const departmentCourses = CIT_U_COURSES[department] || [];
    return departmentCourses.length > 0 &&
      departmentCourses.every(course => formData.selectedCourses.includes(course));
  };

  // const isAnyCourseSelected = (department) => {
  //   const departmentCourses = CIT_U_COURSES[department] || [];
  //   return departmentCourses.some(course => formData.selectedCourses.includes(course));
  // };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'active';
      case 'pending': return 'draft';
      case 'rejected': return 'closed';
      default: return 'draft';
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
              <div>
                {user.contactPerson || user.companyName || user.username || 'User'}
                {user.companyName && user.companyName !== (user.contactPerson || user.username) && (
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    {user.companyName}
                  </div>
                )}
              </div>
              <div className="user-avatar">
                {getInitials()}
              </div>
              {showUserDropdown && (
                <div className="user-dropdown active">
                  <div className="user-dropdown-item">
                    <i className="fas fa-building"></i> {user.companyName || 'Company'}
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-user"></i> {user.contactPerson || 'Contact Person'}
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
                <div key={job.listingID} className="property-card">
                  <div className="property-content">
                    <div className="job-header">
                      <h3 className="property-title">{job.title}</h3>
                      <div className={`property-status-badge ${getStatusBadgeClass(job.status)}`}>
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

                    {/* Applications count */}
                    <div className="applications-count">
                      <i className="fas fa-users"></i>
                      <strong>{job.applications?.length || 0}</strong> Applications
                      {job.applications?.length > 0 && (
                        <span className="pending-count">
                          ({job.applications.filter(app => app.status === 'PENDING').length} pending)
                        </span>
                      )}
                    </div>

                    {job.courses && job.courses.length > 0 && (
                      <div className="targeted-courses">
                        <strong>Targeted Courses:</strong> {job.courses.join(', ')}
                      </div>
                    )}
                    <div className="job-description">
                      {job.description && job.description.length > 100
                        ? `${job.description.substring(0, 100)}...`
                        : job.description}
                    </div>
                    <div className="property-price">{formatSalary(job.salary)}<span className="price-period">/month</span></div>

                    <div className="property-actions">
                      <button className="btn-view" onClick={() => viewJobApplications(job)}>
                        <i className="fas fa-eye"></i> View Applications
                      </button>
                      <button className="btn-edit" onClick={() => editJob(job)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-delete" onClick={() => deleteJob(job.listingID)}>
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

      {/* Job Modal */}
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
                        min="0"
                        step="1000"
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

                  {Object.keys(CIT_U_COURSES).map(department => (
                    <div key={department} className={`amenity-group ${activeDepartmentGroups[department.toLowerCase()] ? 'active' : ''}`}>
                      <div className="amenity-header" onClick={() => toggleDepartmentGroup(department.toLowerCase())}>
                        <div className="amenity-title">
                          <i className={`fas fa-${department === 'CEA' ? 'cogs' :
                            department === 'CCS' ? 'laptop-code' :
                              department === 'CASE' ? 'palette' :
                                department === 'CMBA' ? 'chart-line' :
                                  department === 'CNAHS' ? 'heartbeat' :
                                    'shield-alt'
                            } amenity-icon`}></i>
                          <span>{department} - {{
                            'CEA': 'College of Engineering and Architecture',
                            'CCS': 'College of Computer Studies',
                            'CASE': 'College of Arts, Sciences, and Education',
                            'CMBA': 'College of Management, Business and Accountancy',
                            'CNAHS': 'College of Nursing and Allied Health Sciences',
                            'CCJ': 'College of Criminal Justice'
                          }[department]}</span>
                        </div>
                        <div className="department-actions">
                          <button
                            type="button"
                            className="select-all-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAllCoursesSelected(department)) {
                                deselectAllCoursesInDepartment(department);
                              } else {
                                selectAllCoursesInDepartment(department);
                              }
                            }}
                          >
                            {isAllCoursesSelected(department) ? 'Deselect All' : 'Select All'}
                          </button>
                          <i className={`fas fa-chevron-down amenity-chevron ${activeDepartmentGroups[department.toLowerCase()] ? 'rotated' : ''}`}></i>
                        </div>
                      </div>
                      <div className="amenity-content">
                        <div className="amenity-grid">
                          {CIT_U_COURSES[department].map(course => (
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
                  ))}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editingJobId ? 'Update Job Listing' : 'Create Job Listing'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedJobForApplications && (
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: '1000px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Applications for {selectedJobForApplications.title}</h2>
              <button type="button" className="close-modal" onClick={() => setShowApplicationsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-subtitle">
                Total: {selectedJobApplications.length} applications •
                Pending: {selectedJobApplications.filter(app => app.status === 'PENDING').length}
              </div>

              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Program</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedJobApplications.length > 0 ? (
                    selectedJobApplications.map(application => (
                      <tr key={application.applicationID}>
                        <td>{application.student?.studName || 'N/A'}</td>
                        <td>{application.student?.course || 'N/A'}</td>
                        <td>{formatDate(application.applyDate)}</td>
                        <td>
                          <span className={`application-status status-${application.status?.toLowerCase()}`}>
                            {application.status}
                          </span>
                        </td>
                        <td>
                          <div className="application-actions">
                            <button
                              className="btn-review"
                              onClick={() => viewApplicationDetails(application)}
                            >
                              <i className="fas fa-eye"></i> Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                        <p>No applications yet for this job listing.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplicationsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationDetailsModal && selectedApplication && (
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Review Application</h2>
              <button type="button" className="close-modal" onClick={() => setShowApplicationDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="application-details">
                <div className="student-info">
                  <div className="info-item">
                    <strong>Student Name:</strong><br />
                    {selectedApplication.student?.studName || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Program:</strong><br />
                    {selectedApplication.student?.course || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Year Level:</strong><br />
                    {selectedApplication.student?.studYrLevel || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong><br />
                    {selectedApplication.student?.email || 'N/A'}
                  </div>
                </div>

                <div className="info-item">
                  <strong>Applied Date:</strong><br />
                  {formatDate(selectedApplication.applyDate)}
                </div>

                <div className="info-item">
                  <strong>Resume:</strong><br />
                  {selectedApplication.resumeURL ? (
                    <a href={selectedApplication.resumeURL} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-file-pdf"></i> View Resume
                    </a>
                  ) : 'No resume provided'}
                </div>

                <div className="cover-letter">
                  <strong>Cover Letter:</strong><br />
                  {selectedApplication.coverLetter || 'No cover letter provided'}
                </div>

                <div className="feedback-section">
                  <label className="form-label">Feedback (optional):</label>
                  <textarea
                    value={applicationFeedback}
                    onChange={(e) => setApplicationFeedback(e.target.value)}
                    className="feedback-textarea"
                    placeholder="Provide feedback for the applicant..."
                    rows="4"
                  />
                </div>

                <div className="application-decision-buttons">
                  <button
                    className="btn-accept"
                    onClick={() => updateApplicationStatus('APPROVED')}
                  >
                    <i className="fas fa-check"></i> Accept Application
                  </button>
                  <button
                    className="btn-reject-app"
                    onClick={() => updateApplicationStatus('REJECTED')}
                  >
                    <i className="fas fa-times"></i> Reject Application
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplicationDetailsModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;