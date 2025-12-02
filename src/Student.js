import React, { useState, useEffect, useCallback } from 'react';
import './Student.css';

// CIT-U Courses Constants
//const CIT_U_COURSES = {
/*CEA: [
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
//};
*/

function Student() {
  // State management
  const [student, setStudent] = useState({
    studName: '',
    email: '',
    course: '',
    studYrLevel: '',
    id: null
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [jobListings, setJobListings] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState(null);

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    internshipListing: { listingID: null },
    coverLetter: '',
    resumeURL: '',
    additionalInfo: ''
  });

  // Stats
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app =>
    app.status?.toLowerCase() === 'pending'
  ).length;
  const approvedApplications = applications.filter(app =>
    app.status?.toLowerCase() === 'approved'
  ).length;
  const rejectedApplications = applications.filter(app =>
    app.status?.toLowerCase() === 'rejected'
  ).length;

  const fetchStudentData = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Student data:', userData);

        setStudent({
          studName: userData.studName || userData.username || '',
          email: userData.email || '',
          course: userData.course || userData.studProgram || '',
          studYrLevel: userData.studYrLevel || '',
          id: userData.id
        });
        setStudentId(userData.id);
      }
    } catch (error) {
      console.error('Error setting student data:', error);
    }
  }, []);

  // Fetch job listings matching student's course
  const fetchJobListings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/listings');

      if (response.ok) {
        const allListings = await response.json();
        console.log('All job listings:', allListings);

        // Get the student's application IDs
        const studentApplicationIds = applications.map(app =>
          app.internshipListing?.listingID
        ).filter(id => id);

        console.log('Student has applied to job IDs:', studentApplicationIds);

        // DEBUG: Check each listing individually
        console.log('=== DEBUGGING EACH LISTING ===');
        allListings.forEach((listing, index) => {
          const status = listing.status || 'pending';
          const isApproved = status.toLowerCase() === 'approved';

          const listingCourses = listing.courses || [];
          const matchesCourse = listingCourses.includes(student.course);

          const notApplied = !studentApplicationIds.includes(listing.listingID);

          console.log(`Listing ${index + 1} (ID: ${listing.listingID}):`, {
            title: listing.title,
            status: listing.status,
            isApproved: isApproved,
            courses: listingCourses,
            studentCourse: student.course,
            matchesCourse: matchesCourse,
            alreadyApplied: !notApplied,
            shouldShow: isApproved && matchesCourse && notApplied
          });
        });

        // Filter listings:
        const filteredListings = allListings.filter(listing => {
          const status = listing.status || 'pending';
          const isApproved = status.toLowerCase() === 'approved';
          const matchesCourse = listing.courses && listing.courses.includes(student.course);
          const notApplied = !studentApplicationIds.includes(listing.listingID);

          return isApproved && matchesCourse && notApplied;
        });

        console.log('Available job listings (filtered):', filteredListings);
        setJobListings(filteredListings);
      } else {
        console.error('Failed to fetch job listings:', response.status);
        setJobListings([]);
      }
    } catch (error) {
      console.error('Error fetching job listings:', error);
      setJobListings([]);
    }
  }, [student.course, applications]);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      if (!studentId) {
        console.log('No student ID, skipping fetch');
        return;
      }

      console.log('Fetching applications for student ID:', studentId);

      const response = await fetch(`http://localhost:8080/api/applications/student/${studentId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });

      console.log('Fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched applications:', data);

        // Make sure applications have the right structure
        const formattedApplications = data.map(app => ({
          applicationID: app.applicationID || app.id,
          applyDate: app.applyDate || app.applicationDate,
          status: app.status || app.applicationStatus,
          coverLetter: app.coverLetter || '',
          resumeURL: app.resumeURL || app.resume,
          additionalInfo: app.additionalInfo || '',
          internshipListing: app.internshipListing || {},
          student: app.student || {}
        }));

        console.log('Formatted applications:', formattedApplications);
        setApplications(formattedApplications);

        // Log counts by status
        const pendingCount = formattedApplications.filter(app => app.status === 'PENDING').length;
        const approvedCount = formattedApplications.filter(app => app.status === 'APPROVED').length;
        const rejectedCount = formattedApplications.filter(app => app.status === 'REJECTED').length;
        console.log(`Stats: ${pendingCount} pending, ${approvedCount} approved, ${rejectedCount} rejected`);

      } else {
        console.error('Failed to fetch applications:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  }, [studentId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const mockNotifications = [
        {
          id: 1,
          message: 'Your application has been viewed',
          type: 'application',
          is_read: false,
          created_at: '2 hours ago'
        },
        {
          id: 2,
          message: 'New job matching your profile',
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
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (studentId) {
      fetchApplications();
      fetchNotifications();
    }
  }, [studentId, fetchApplications, fetchNotifications]);

  useEffect(() => {
    if (student.course) {
      fetchJobListings();
    }
  }, [student.course, fetchJobListings]);

  // Refetch job listings when applications change (to hide applied jobs)
  useEffect(() => {
    if (student.course && applications.length > 0) {
      fetchJobListings();
    }
  }, [applications, student.course, fetchJobListings]);

  // Modal handlers
  const openModal = (job) => {
    setApplicationForm({
      internshipListing: { listingID: job.listingID },
      coverLetter: '',
      resumeURL: student.resumeURL || '',
      additionalInfo: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setApplicationForm({
      internshipListing: { listingID: null },
      coverLetter: '',
      resumeURL: '',
      additionalInfo: ''
    });
  };

  // Job listing modal handlers
  const openJobModal = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit application
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        internshipListing: { listingID: applicationForm.internshipListing.listingID },
        student: { id: studentId },
        applyDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        coverLetter: applicationForm.coverLetter,
        resumeURL: applicationForm.resumeURL,
        additionalInfo: applicationForm.additionalInfo
      };

      console.log('Submitting application:', applicationData);

      const response = await fetch('http://localhost:8080/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        const savedApplication = await response.json();

        // 1. Add to applications list
        setApplications(prev => [...prev, savedApplication]);

        // 2. Remove the job from jobListings (so it disappears from Browse tab)
        setJobListings(prev =>
          prev.filter(job => job.listingID !== applicationForm.internshipListing.listingID)
        );

        // 3. Close modal
        closeModal();

        // 4. Show success message
        showNotification('Application submitted successfully!', 'success');

        // 5. Switch to Applications tab
        setActiveTab('applications');
      } else {
        const errorText = await response.text();
        showNotification(`Error submitting application: ${errorText}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showNotification('Error submitting application', 'error');
    } finally {
      setLoading(false);
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

  // Withdraw application
  // Withdraw application
  const withdrawApplication = async (applicationId) => {
    // Find the application in current state to check status
    const application = applications.find(app => app.applicationID === applicationId);

    // Prevent withdrawal of approved/rejected applications from frontend
    if (application && application.status !== 'PENDING') {
      showNotification('Cannot withdraw an application that has already been approved or rejected', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/applications/${applicationId}`, {
          method: 'DELETE',
          mode: 'cors',
          credentials: 'include'
        });

        console.log('Delete response status:', response.status);

        if (response.ok || response.status === 204) {
          // Success - remove from UI
          setApplications(prev => prev.filter(app => app.applicationID !== applicationId));
          showNotification('Application withdrawn successfully', 'success');
        } else if (response.status === 409) {
          // Conflict - application not pending
          const errorData = await response.json();
          console.log('Conflict error:', errorData);
          showNotification(errorData.message || 'Cannot withdraw this application', 'error');

          // Refresh applications to get current status
          fetchApplications();
        } else if (response.status === 404) {
          // Not found - might have been deleted already
          showNotification('Application not found', 'error');
          // Refresh applications list
          fetchApplications();
        } else {
          const errorText = await response.text();
          console.error('Delete error:', errorText);
          showNotification(`Error: ${errorText}`, 'error');
        }
      } catch (error) {
        console.error('Network error withdrawing application:', error);
        showNotification('Network error. Please check your connection.', 'error');
      }
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(application => {
    if (activeFilter === 'all') return true;
    return application.status?.toLowerCase() === activeFilter;
  });

  // Utility functions
  const showNotification = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const getInitials = () => {
    if (student.studName && student.studName.trim()) {
      return student.studName.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    return 'S';
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

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved': return 'active';
      case 'pending': return 'draft';
      case 'rejected': return 'closed';
      default: return 'draft';
    }
  };

  const getStatusText = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved': return 'Approved';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  // Tab switcher component
  const TabSwitcher = () => (
    <div className="tab-switcher">
      <button
        className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
        onClick={() => setActiveTab('applications')}
      >
        My Applications
      </button>
      <button
        className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
        onClick={() => setActiveTab('jobs')}
      >
        Browse Internships
      </button>
    </div>
  );

  // Add this CSS to your Student.css
  const tabSwitcherStyles = `
    .tab-switcher {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .tab-button {
      padding: 10px 20px;
      border: 2px solid var(--primary);
      background: white;
      color: var(--primary);
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .tab-button.active {
      background: var(--primary);
      color: white;
    }
    
    .tab-button:hover:not(.active) {
      background: #f5f5f5;
    }
    
    .program-filter {
      background: #f8f9fa;
      padding: 10px 15px;
      border-radius: 5px;
      margin: 15px 0;
      border: 1px solid #dee2e6;
    }
    
    .program-tag {
      background: var(--primary);
      color: white;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      margin: 2px;
      display: inline-block;
    }
  `;

  return (
    <div className="App">
      {/* Add inline styles for new components */}
      <style>{tabSwitcherStyles}</style>

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
              <div>{student.studName || 'Student'}</div>
              <div className="user-avatar">
                {getInitials()}
              </div>
              {showUserDropdown && (
                <div className="user-dropdown active">
                  <div className="user-dropdown-item">
                    <i className="fas fa-user-circle"></i> {student.studName}
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-graduation-cap"></i> {student.course}
                  </div>
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
              <h1 className="dashboard-title">
                {activeTab === 'applications' ? 'My Applications' : 'Available Internships'}
              </h1>
              <p className="dashboard-subtitle">
                {activeTab === 'applications'
                  ? 'Track your job applications and internship opportunities'
                  : `Internship opportunities for ${student.course || 'your program'}`}
              </p>
            </div>

            {/* Tab Switcher */}
            <TabSwitcher />
          </div>

          {/* Student Stats */}
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

          {/* Filters - Only show for applications tab */}
          {activeTab === 'applications' && (
            <>
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
            </>
          )}

          {/* Tab Content */}
          {activeTab === 'applications' ? (
            <>
              {/* Applications Grid */}
              {/* Applications Grid */}
              <div className="properties-container">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map(application => {
                    // Debug log
                    console.log('Application data:', application);

                    // Check if internshipListing exists
                    if (!application.internshipListing || Object.keys(application.internshipListing).length === 0) {
                      console.log('Missing internshipListing for application:', application.applicationID);
                      return (
                        <div key={application.applicationID} className="property-card">
                          <div className="property-content">
                            <div className="job-header">
                              <h3 className="property-title">Job Title Not Found</h3>
                              <div className={`property-status-badge ${getStatusBadgeClass(application.status)}`}>
                                {getStatusText(application.status)}
                              </div>
                            </div>
                            <div className="property-location">
                              <i className="fas fa-building"></i> Company Information Not Available
                            </div>
                            <div className="property-details">
                              <span>Applied: {formatDate(application.applyDate)}</span>
                            </div>
                            <div className="property-actions">
                              <button className="btn-edit" onClick={() => openJobModal(job)}>
                                <i className="fas fa-eye"></i> View Job Details
                              </button>
                              {application.status?.toLowerCase() === 'pending' && (
                                <button className="btn-delete" onClick={() => withdrawApplication(application.applicationID)}>
                                  <i className="fas fa-times"></i> Withdraw
                                </button>
                              )}
                              {/* Show different message for approved/rejected applications */}
                              {application.status?.toLowerCase() === 'approved' && (
                                <span className="status-message" style={{ color: 'green', fontWeight: 'bold' }}>
                                  ✓ Application Approved
                                </span>
                              )}
                              {application.status?.toLowerCase() === 'rejected' && (
                                <span className="status-message" style={{ color: '#8B0000', fontWeight: 'bold' }}>
                                  ✗ Application Not Selected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const job = application.internshipListing;
                    const company = job?.company;

                    return (
                      <div key={application.applicationID} className="property-card">
                        <div className="property-content">
                          <div className="job-header">
                            <h3 className="property-title">{job?.title || 'Job Title'}</h3>
                            <div className={`property-status-badge ${getStatusBadgeClass(application.status)}`}>
                              {getStatusText(application.status)}
                            </div>
                          </div>
                          <div className="property-location">
                            <i className="fas fa-building"></i> {company?.companyName || 'Company'} • {job?.location || 'Location'}
                          </div>
                          <div className="property-details">
                            <span>Applied: {formatDate(application.applyDate)}</span> •
                            <span> Type: {job?.duration || 'Internship'}</span>
                          </div>
                          {application.coverLetter && (
                            <div className="job-description">
                              <strong>Cover Letter:</strong><br />
                              {application.coverLetter.length > 150
                                ? `${application.coverLetter.substring(0, 150)}...`
                                : application.coverLetter}
                            </div>
                          )}
                          {application.feedback && (
                            <div className="application-feedback">
                              <strong>Company Feedback:</strong><br />
                              {application.feedback}
                            </div>
                          )}
                          <div className="property-price">
                            {formatSalary(job?.salary)}
                            <span className="price-period">/month</span>
                          </div>

                          <div className="property-actions">
                            <button className="btn-edit" onClick={() => openJobModal(job)}>
                              <i className="fas fa-eye"></i> View Job Details
                            </button>
                            {application.status === 'PENDING' && (
                              <button className="btn-delete" onClick={() => withdrawApplication(application.applicationID)}>
                                <i className="fas fa-times"></i> Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-properties">
                    <p>No applications yet. Click "Browse Internships" to start applying!</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Job Listings Stats */}
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-number">{jobListings.length}</div>
                  <div className="stat-label">Available Internships</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {jobListings.filter(job => job.modality === 'Remote').length}
                  </div>
                  <div className="stat-label">Remote Opportunities</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {jobListings.filter(job => job.modality === 'Hybrid').length}
                  </div>
                  <div className="stat-label">Hybrid Positions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {jobListings.filter(job => job.salary && job.salary >= 20000).length}
                  </div>
                  <div className="stat-label">High-Paying Roles</div>
                </div>
              </div>

              <div className="program-filter">
                <strong>Showing internships for:</strong> {student.course || 'Your Program'}
              </div>

              <div className="divider"></div>

              {/* Job Listings Grid */}
              <div className="properties-container">
                {jobListings.length > 0 ? (
                  jobListings.map(job => (
                    <div key={job.listingID} className="property-card">
                      <div className="property-content">
                        <div className="job-header">
                          <h3 className="property-title">{job.title}</h3>
                          <div className={`property-status-badge active`}>
                            Active
                          </div>
                        </div>
                        <div className="property-location">
                          <i className="fas fa-building"></i> {job.company?.companyName || 'Company'} • {job.location}
                        </div>
                        <div className="property-details">
                          <span>Posted: {formatDate(job.postDate)}</span> •
                          <span> Deadline: {formatDate(job.deadline)}</span> •
                          <span> Duration: {job.duration}</span>
                        </div>

                        {/* Targeted Programs */}
                        {job.courses && job.courses.length > 0 && (
                          <div className="targeted-courses">
                            <strong>For Programs:</strong>
                            <div style={{ marginTop: '5px' }}>
                              {job.courses.map((course, index) => (
                                <span key={index} className="program-tag">
                                  {course}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="job-description">
                          {job.description && job.description.length > 150
                            ? `${job.description.substring(0, 150)}...`
                            : job.description}
                        </div>

                        <div className="property-price">
                          {formatSalary(job.salary)}
                          <span className="price-period">/month</span>
                        </div>

                        <div className="property-actions">
                          <button className="btn-edit" onClick={() => openJobModal(job)}>
                            <i className="fas fa-eye"></i> View Details
                          </button>
                          <button className="btn-edit" onClick={() => openModal(job)}>
                            <i className="fas fa-paper-plane"></i> Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-properties">
                    <p>
                      {student.course
                        ? `No internship listings available for ${student.course} at the moment. Check back later!`
                        : 'Complete your profile to see relevant internship opportunities.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
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
                    <label className="form-label">Resume URL</label>
                    <input
                      type="text"
                      name="resumeURL"
                      value={applicationForm.resumeURL}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://drive.google.com/your-resume.pdf"
                    />
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
                        <strong>Program:</strong> {student.course}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="half-width">
                        <strong>Year Level:</strong> {student.studYrLevel}
                      </div>
                      <div className="half-width">
                        <strong>Email:</strong> {student.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{selectedJob.title}</h2>
              <button type="button" className="close-modal" onClick={closeJobModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="job-details-section">
                <div className="job-basic-info">
                  <div className="info-row">
                    <div className="info-item">
                      <strong>Company:</strong> {selectedJob.company?.companyName || 'Not specified'}
                    </div>
                    <div className="info-item">
                      <strong>Location:</strong> {selectedJob.location}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-item">
                      <strong>Work Modality:</strong> {selectedJob.modality}
                    </div>
                    <div className="info-item">
                      <strong>Duration:</strong> {selectedJob.duration}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-item">
                      <strong>Salary:</strong> {formatSalary(selectedJob.salary)}/month
                    </div>
                    <div className="info-item">
                      <strong>Application Deadline:</strong> {formatDate(selectedJob.deadline)}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Job Description</h3>
                  <div className="job-description-content">
                    {selectedJob.description}
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Requirements</h3>
                  <div className="job-requirements-content">
                    {selectedJob.requirements}
                  </div>
                </div>

                {selectedJob.courses && selectedJob.courses.length > 0 && (
                  <div className="form-section">
                    <h3 className="section-title">Targeted Programs</h3>
                    <div className="targeted-programs-list">
                      {selectedJob.courses.map((course, index) => (
                        <span key={index} className="program-tag">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeJobModal}>
                  Close
                </button>
                {/* Only show Apply Now button if we're in the Browse Internships tab */}
                {activeTab === 'jobs' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      closeJobModal();
                      openModal(selectedJob);
                    }}
                  >
                    <i className="fas fa-paper-plane"></i> Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}      </div>
  )
}


export default Student;