import React, { useState, useEffect } from 'react';
import './Coordinator.css';

function Coordinator() {
  // State management
  const [user, setUser] = useState({
    username: 'coordinator_user',
    first_name: 'Coordinator',
    last_name: 'User'
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data for testing
  const mockJobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Manila',
      salary: 50000,
      modality: 'Hybrid',
      duration: 'Full-time',
      postDate: '2024-01-15',
      deadline: '2024-02-15',
      description: 'We are looking for a skilled software engineer with experience in modern web technologies. The ideal candidate will have strong problem-solving skills and ability to work in a fast-paced environment.',
      requirements: '3+ years experience, JavaScript, React, Node.js, SQL, Git',
      status: 'pending',
      cea: false,
      ccs: true,
      case: false,
      cmba: false,
      cnahs: false,
      ccj: false
    },
    {
      id: 2,
      title: 'Marketing Manager',
      company: 'Digital Agency Inc',
      location: 'Remote',
      salary: 45000,
      modality: 'Remote',
      duration: 'Full-time',
      postDate: '2024-01-10',
      deadline: '2024-02-10',
      description: 'Seeking an experienced Marketing Manager to lead our digital marketing campaigns and drive brand awareness.',
      requirements: '5+ years marketing experience, SEO, Social Media, Content Strategy, Analytics',
      status: 'approved',
      cea: false,
      ccs: false,
      case: true,
      cmba: true,
      cnahs: false,
      ccj: false
    },
    {
      id: 3,
      title: 'Civil Engineer',
      company: 'Construction Partners',
      location: 'Cebu',
      salary: 40000,
      modality: 'On-site',
      duration: 'Full-time',
      postDate: '2024-01-05',
      deadline: '2024-01-30',
      description: 'Civil engineer needed for infrastructure projects including bridges, roads, and building construction.',
      requirements: 'Civil Engineering license, 2+ years experience, AutoCAD, Project Management',
      status: 'rejected',
      rejection_reason: 'Insufficient experience requirements for this senior position',
      cea: true,
      ccs: false,
      case: false,
      cmba: false,
      cnahs: false,
      ccj: false
    },
    {
      id: 4,
      title: 'Nursing Supervisor',
      company: 'Metro Hospital',
      location: 'Quezon City',
      salary: 55000,
      modality: 'On-site',
      duration: 'Full-time',
      postDate: '2024-01-20',
      deadline: '2024-02-20',
      description: 'Looking for a Nursing Supervisor to oversee nursing staff and ensure quality patient care.',
      requirements: 'Registered Nurse, 5+ years experience, Supervisory experience, BLS/ACLS certified',
      status: 'pending',
      cea: false,
      ccs: false,
      case: false,
      cmba: false,
      cnahs: true,
      ccj: false
    }
  ];

  // Stats
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'rejected').length;

  // Fetch initial data
  useEffect(() => {
    fetchJobs();
    fetchNotifications();
  }, []);

  // Filter jobs when search term or status filter changes
  useEffect(() => {
    const filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      // Use mock data for testing
      setJobs(mockJobs);
      
      // For real API later:
      // const response = await fetch('/api/coordinator/jobs');
      // const data = await response.json();
      // setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications
      setNotifications([
        {
          id: 1,
          message: 'New job listing requires approval: Software Engineer',
          notification_type: 'new_job',
          is_read: false,
          created_at: '2 hours ago'
        },
        {
          id: 2,
          message: 'Job listing approved: Marketing Manager',
          notification_type: 'approval',
          is_read: true,
          created_at: '1 day ago'
        }
      ]);
      setUnreadCount(1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Job actions
  const approveJob = async (jobId) => {
    try {
      // Mock API call
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'approved' } : job
      ));
      showNotification('Job listing approved successfully', 'success');
      
      // For real API later:
      // const response = await fetch(`/api/coordinator/jobs/${jobId}/approve`, {
      //   method: 'POST'
      // });
    } catch (error) {
      console.error('Error approving job:', error);
      showNotification('Error approving job listing', 'error');
    }
  };

  const rejectJob = async (jobId, reason) => {
    try {
      // Mock API call
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'rejected', rejection_reason: reason } : job
      ));
      setRejectionReason('');
      setShowJobModal(false);
      showNotification('Job listing rejected successfully', 'success');
      
      // For real API later:
      // const response = await fetch(`/api/coordinator/jobs/${jobId}/reject`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ reason })
      // });
    } catch (error) {
      console.error('Error rejecting job:', error);
      showNotification('Error rejecting job listing', 'error');
    }
  };

  const openRejectModal = (job) => {
    setSelectedJob(job);
    setRejectionReason(job.rejection_reason || '');
    setShowJobModal(true);
  };

  const viewJobDetails = (job) => {
    setSelectedJob(job);
    setRejectionReason(job.rejection_reason || '');
    setShowJobModal(true);
  };

  // Notification handlers
  const markAsRead = async (notificationId) => {
    try {
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
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

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
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getDepartmentsList = (job) => {
    const departments = [];
    if (job.cea) departments.push('CEA');
    if (job.ccs) departments.push('CCS');
    if (job.case) departments.push('CASE');
    if (job.cmba) departments.push('CMBA');
    if (job.cnahs) departments.push('CNAHS');
    if (job.ccj) departments.push('CCJ');
    return departments.join(', ');
  };

  return (
    <div className="Coordinator">
      {/* Header */}
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section">
            <h2>HIRE<span>archy</span> <span className="coordinator-badge">Coordinator</span></h2>
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
                          {notification.notification_type === 'new_job' ? '📄'
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
                    <i className="fas fa-user-circle"></i> Coordinator Profile
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
              <h1 className="dashboard-title">Job Listings Management</h1>
              <p className="dashboard-subtitle">Review and manage all job postings</p>
            </div>
            <div className="coordinator-actions">
              <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{totalJobs}</div>
              <div className="stat-label">Total Listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{pendingJobs}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{approvedJobs}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{rejectedJobs}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="coordinator-controls">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <div className="results-count">
                {filteredJobs.length} job(s) found
              </div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          {/* Jobs Table */}
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Departments</th>
                  <th>Posted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <tr key={job.id} className="job-row">
                      <td>
                        <div className="job-title-cell">
                          <strong>{job.title}</strong>
                          <button 
                            className="view-details-btn"
                            onClick={() => viewJobDetails(job)}
                            title="View full details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                      <td>{job.company || 'N/A'}</td>
                      <td>
                        <div className="location-cell">
                          <i className="fas fa-map-marker-alt"></i>
                          {job.location}
                        </div>
                      </td>
                      <td className="salary-cell">{formatSalary(job.salary)}</td>
                      <td className="departments-cell">
                        <span className="departments-tag">{getDepartmentsList(job)}</span>
                      </td>
                      <td>{formatDate(job.postDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {job.status === 'pending' && (
                            <>
                              <button 
                                className="btn-approve"
                                onClick={() => approveJob(job.id)}
                                title="Approve job listing"
                              >
                                <i className="fas fa-check"></i>
                                Approve
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => openRejectModal(job)}
                                title="Reject job listing"
                              >
                                <i className="fas fa-times"></i>
                                Reject
                              </button>
                            </>
                          )}
                          {(job.status === 'approved' || job.status === 'rejected') && (
                            <span className="action-completed">
                              {job.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-jobs">
                      <div className="no-jobs-content">
                        <i className="fas fa-search"></i>
                        <p>No job listings found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
        
        {/* Footer */}
        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h3>HIREarchy Coordinator</h3>
              <p>Coordinator dashboard for reviewing and managing job listings from companies.</p>
            </div>
            
            <div className="footer-section">
              <h3>Quick Actions</h3>
              <ul className="footer-links">
                <li><a href="#">Job Queue</a></li>
                <li><a href="#">Analytics</a></li>
                <li><a href="#">Approval History</a></li>
                <li><a href="#">Settings</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Support</h3>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Support</a></li>
                <li><a href="#">Guidelines</a></li>
                <li><a href="#">System Status</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Contact</h3>
              <div className="contact-info">
                <a href="mailto:coordinator@hirearchy.com">
                  <i className="fas fa-envelope"></i> coordinator@hirearchy.com
                </a>
                <a href="tel:1-800-COORD-NOW">
                  <i className="fas fa-phone"></i> 1-800-COORD-NOW
                </a>
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i> Coordinator Office
                </div>
              </div>
            </div>
          </div>
          
          <div className="copyright">
            © 2025 HIREarchy Coordinator Panel. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="modal-overlay active">
          <div className="modal coordinator-modal">
            <div className="modal-header">
              <h2 className="modal-title">Job Listing Details</h2>
              <button type="button" className="close-modal" onClick={() => setShowJobModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="job-details-grid">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-row">
                    <label>Job Title:</label>
                    <span>{selectedJob.title}</span>
                  </div>
                  <div className="detail-row">
                    <label>Company:</label>
                    <span>{selectedJob.company || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Location:</label>
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="detail-row">
                    <label>Work Modality:</label>
                    <span>{selectedJob.modality}</span>
                  </div>
                  <div className="detail-row">
                    <label>Employment Duration:</label>
                    <span>{selectedJob.duration}</span>
                  </div>
                  <div className="detail-row">
                    <label>Monthly Salary:</label>
                    <span className="salary-highlight">{formatSalary(selectedJob.salary)}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Timeline</h3>
                  <div className="detail-row">
                    <label>Posted Date:</label>
                    <span>{formatDate(selectedJob.postDate)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Application Deadline:</label>
                    <span>{formatDate(selectedJob.deadline)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Current Status:</label>
                    <span className={`status-badge ${getStatusBadgeClass(selectedJob.status)}`}>
                      {selectedJob.status}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h3>Job Description</h3>
                  <div className="description-box">
                    {selectedJob.description}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h3>Requirements</h3>
                  <div className="requirements-box">
                    {selectedJob.requirements}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h3>Target Departments</h3>
                  <div className="departments-list">
                    {getDepartmentsList(selectedJob)}
                  </div>
                </div>

                {selectedJob.status === 'rejected' && selectedJob.rejection_reason && (
                  <div className="detail-section full-width">
                    <h3>Rejection Reason</h3>
                    <div className="rejection-reason">
                      {selectedJob.rejection_reason}
                    </div>
                  </div>
                )}

                {selectedJob.status === 'pending' && (
                  <div className="detail-section full-width">
                    <h3>Coordinator Actions</h3>
                    <div className="coordinator-action-buttons">
                      <button 
                        className="btn-approve-large"
                        onClick={() => approveJob(selectedJob.id)}
                      >
                        <i className="fas fa-check"></i>
                        Approve Job Listing
                      </button>
                      <div className="reject-section">
                        <label>Rejection Reason (optional):</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide reason for rejection..."
                          rows="3"
                          className="rejection-textarea"
                        />
                        <button 
                          className="btn-reject-large"
                          onClick={() => rejectJob(selectedJob.id, rejectionReason)}
                        >
                          <i className="fas fa-times"></i>
                          Reject Job Listing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}    
    </div>
  );
}

export default Coordinator;