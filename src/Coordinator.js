import React, { useState, useEffect, useCallback } from 'react';
import './Coordinator.css';

function Coordinator() {
  // State management
  const [user, setUser] = useState({
    username: '',
    coordinatorName: '',
    coordinatorDepartment: '',
    id: null
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [coordinatorId, setCoordinatorId] = useState(null);

  const fetchCoordinatorData = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Coordinator data:', userData);

        setUser({
          username: userData.username || '',
          coordinatorName: userData.coordinatorName || '',
          coordinatorDepartment: userData.coordinatorDepartment || '',
          id: userData.id
        });
        setCoordinatorId(userData.id);
      }
    } catch (error) {
      console.error('Error setting coordinator data:', error);
    }
  }, []);

  // Stats
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'rejected').length;

  // Fetch initial data
  useEffect(() => {
    fetchCoordinatorData();
  }, [fetchCoordinatorData]);

  useEffect(() => {
    if (coordinatorId) {
      fetchJobs();
      fetchNotifications();
    }
  }, [coordinatorId]);

  // Filter jobs when search term or status filter changes
  useEffect(() => {
    const filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs for coordinator:', coordinatorId, 'Department:', user.coordinatorDepartment);

      if (!coordinatorId || !user.coordinatorDepartment) {
        console.error('Coordinator ID or Department missing');
        return;
      }

      // Use the coordinator-specific endpoint you created
      const response = await fetch(
        `http://localhost:8080/api/coordinator/department/jobs?coordinatorId=${coordinatorId}`
      );

      if (response.ok) {
        let departmentJobs = await response.json();
        console.log('Department jobs from API:', departmentJobs);

        // Fetch company details for each job (if not already included)
        const jobsWithCompanyDetails = await Promise.all(
          departmentJobs.map(async (job) => {
            // If company object is minimal (only has ID), fetch full details
            if (job.company && job.company.id && !job.company.companyName) {
              try {
                const companyResponse = await fetch(`http://localhost:8080/api/companies/${job.company.id}`);
                if (companyResponse.ok) {
                  const companyData = await companyResponse.json();
                  return {
                    ...job,
                    company: companyData
                  };
                }
              } catch (error) {
                console.error(`Error fetching company for job ${job.listingID}:`, error);
              }
            }
            return job;
          })
        );

        console.log('Jobs with company details:', jobsWithCompanyDetails);
        setJobs(jobsWithCompanyDetails);
      } else {
        console.error('Failed to fetch department jobs:', response.status);

        // Fallback: Get all jobs and filter manually
        const allJobsResponse = await fetch('http://localhost:8080/api/listings');
        if (allJobsResponse.ok) {
          const allJobs = await allJobsResponse.json();
          console.log('All jobs fetched for manual filtering:', allJobs);

          // Filter jobs by coordinator's department
          const filteredJobs = allJobs.filter(job => {
            if (!job.courses || job.courses.length === 0) return false;

            // Check if any course in the job belongs to coordinator's department
            return job.courses.some(course => {
              // This is a simplified check - you might want to use DepartmentCourseMapper
              const departmentMap = {
                'CEA': ['Architecture', 'Engineering', 'Chemical', 'Civil', 'Computer', 'Electrical', 'Electronics', 'Industrial', 'Mechanical', 'Mining'],
                'CCS': ['Information Technology', 'Computer Science', 'IT', 'CS'],
                'CASE': ['Arts', 'Sciences', 'Education', 'Communication', 'Psychology', 'Biology', 'Math', 'English', 'Multimedia'],
                'CMBA': ['Business', 'Accountancy', 'Management', 'Hospitality', 'Tourism', 'Office Administration', 'Public Administration'],
                'CNAHS': ['Nursing', 'Pharmacy', 'Medical'],
                'CCJ': ['Criminology']
              };

              const keywords = departmentMap[user.coordinatorDepartment.toUpperCase()] || [];
              const courseLower = course.toLowerCase();
              return keywords.some(keyword =>
                courseLower.includes(keyword.toLowerCase())
              );
            });
          });

          // Fetch company details for filtered jobs
          const jobsWithDetails = await Promise.all(
            filteredJobs.map(async (job) => {
              if (job.company && job.company.id) {
                try {
                  const companyResponse = await fetch(`http://localhost:8080/api/companies/${job.company.id}`);
                  if (companyResponse.ok) {
                    const companyData = await companyResponse.json();
                    return {
                      ...job,
                      company: companyData
                    };
                  }
                } catch (error) {
                  console.error(`Error fetching company for job ${job.listingID}:`, error);
                }
              }
              return job;
            })
          );

          console.log('Filtered jobs with company details:', jobsWithDetails);
          setJobs(jobsWithDetails);
        } else {
          console.error('Failed to fetch all jobs');
          setJobs([]);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const mockNotifications = [
        {
          id: 1,
          message: 'New job listing requires approval',
          notification_type: 'new_job',
          is_read: false,
          created_at: '2 hours ago'
        },
        {
          id: 2,
          message: 'Job listing approved',
          notification_type: 'approval',
          is_read: true,
          created_at: '1 day ago'
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Job approval
  // Job approval
  const approveJob = async (jobId) => {
    if (!coordinatorId) {
      showNotification('Coordinator ID not found', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to approve this job listing?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/coordinator/jobs/${jobId}/approve?coordinatorId=${coordinatorId}`, {
          method: 'POST'
        });

        if (response.ok) {
          const updatedJob = await response.json();

          // Fetch company details for the updated job
          if (updatedJob.company && updatedJob.company.id) {
            const companyResponse = await fetch(`http://localhost:8080/api/companies/${updatedJob.company.id}`);
            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              updatedJob.company = companyData;
            }
          }

          setJobs(prev => prev.map(job =>
            job.listingID === jobId ? updatedJob : job
          ));
          setShowJobModal(false);
          showNotification('Job listing approved successfully', 'success');
        } else if (response.status === 403) {
          showNotification('You do not have permission to approve listings from this department', 'error');
        } else {
          showNotification('Error approving job listing', 'error');
        }
      } catch (error) {
        console.error('Error approving job:', error);
        showNotification('Error approving job listing', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchCompanyData = async (companyId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${companyId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  };

  // Job rejection
  const rejectJob = async (jobId, reason) => {
    if (!coordinatorId) {
      showNotification('Coordinator ID not found', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to reject this job listing?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/coordinator/jobs/${jobId}/reject?coordinatorId=${coordinatorId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason })
        });

        if (response.ok) {
          const updatedJob = await response.json();

          // Fetch company details for the updated job
          const jobWithCompany = await fetchCompanyDetails(updatedJob);

          setJobs(prev => prev.map(job =>
            job.listingID === jobId ? jobWithCompany : job
          ));
          setRejectionReason('');
          setShowJobModal(false);
          showNotification('Job listing rejected successfully', 'success');
        } else if (response.status === 403) {
          showNotification('You do not have permission to reject listings from this department', 'error');
        } else {
          showNotification('Error rejecting job listing', 'error');
        }
      } catch (error) {
        console.error('Error rejecting job:', error);
        showNotification('Error rejecting job listing', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to fetch company details
  const fetchCompanyDetails = async (job) => {
    try {
      // If job already has company with name, return as is
      if (job.company?.companyName) {
        return job;
      }

      // If job has company with ID, fetch details
      if (job.company?.id) {
        const companyResponse = await fetch(`http://localhost:8080/api/companies/${job.company.id}`);
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          return {
            ...job,
            company: companyData
          };
        }
      }

      return job;
    } catch (error) {
      console.error('Error fetching company details:', error);
      return job;
    }
  };

  // Also update viewJobDetails to fetch company details
  const viewJobDetails = async (job) => {
    // Fetch fresh company data before showing modal
    if (job.company?.id && !job.company.companyName) {
      try {
        const companyResponse = await fetch(`http://localhost:8080/api/companies/${job.company.id}`);
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          job.company = companyData;
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    }

    setSelectedJob(job);
    setRejectionReason(job.rejectionReason || '');
    setShowJobModal(true);
  };

  const openRejectModal = (job) => {
    setSelectedJob(job);
    setRejectionReason(job.rejectionReason || '');
    setShowJobModal(true);
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

  // Utility functions
  const showNotification = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const getInitials = () => {
    if (user.coordinatorName && user.coordinatorName.trim()) {
      const names = user.coordinatorName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.coordinatorName[0].toUpperCase();
    }
    return user.username[0]?.toUpperCase() || 'C';
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
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getDepartmentsList = (job) => {
    // Extract courses and group by department
    if (!job.courses || job.courses.length === 0) return 'All Departments';

    const departmentMap = {
      'CEA': ['Architecture', 'Engineering'],
      'CCS': ['Information Technology', 'Computer Science'],
      'CASE': ['Arts', 'Sciences', 'Education'],
      'CMBA': ['Business', 'Accountancy', 'Management'],
      'CNAHS': ['Nursing', 'Pharmacy', 'Medical Technology'],
      'CCJ': ['Criminology']
    };

    const departments = new Set();
    job.courses.forEach(course => {
      for (const [dept, keywords] of Object.entries(departmentMap)) {
        if (keywords.some(keyword => course.includes(keyword))) {
          departments.add(dept);
        }
      }
    });

    return Array.from(departments).join(', ');
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  // Close modal when clicking outside
  const handleModalClose = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setShowJobModal(false);
    }
  };

  return (
    <div className="Coordinator">
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
              <div>
                {user.coordinatorName || user.username}
                {user.coordinatorDepartment && (
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    {user.coordinatorDepartment}
                  </div>
                )}
              </div>
              <div className="user-avatar">
                {getInitials()}
              </div>
              {showUserDropdown && (
                <div className="user-dropdown active">
                  <div className="user-dropdown-item">
                    <i className="fas fa-user-circle"></i> {user.coordinatorName || 'Coordinator'}
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-building"></i> {user.coordinatorDepartment || 'Department'}
                  </div>
                  <div className="user-dropdown-item">
                    <i className="fas fa-cog"></i> Settings
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item logout-item">
                    <button
                      onClick={handleLogout}
                      className="logout-btn"
                    >
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
            <div className="admin-actions">
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
          <div className="admin-controls">
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

          {/* Jobs Grid - Card Layout */}
          <div className="properties-container">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job.listingID} className="property-card">
                  <div className="property-content">
                    {/* Job Header */}
                    <div className="job-header">
                      <h3 className="property-title">{job.title}</h3>
                      <div className={`property-status-badge ${job.status === 'pending' ? 'draft' :
                        job.status === 'approved' ? 'active' : 'closed'}`}>
                        {job.status}
                      </div>
                    </div>

                    {/* Company and Location */}
                    <div className="property-location">
                      <i className="fas fa-building"></i>
                      {job.company?.companyName || 'Company Not Available'} •
                      <i className="fas fa-map-marker-alt" style={{ marginLeft: '10px' }}></i> {job.location}
                    </div>

                    {/* Job Details */}
                    <div className="property-details">
                      <span>Posted: {formatDate(job.postDate)}</span> •
                      <span> Deadline: {formatDate(job.deadline)}</span> •
                      <span> Type: {job.duration}</span>
                    </div>

                    {/* Salary */}
                    <div className="property-price">
                      {formatSalary(job.salary)}
                      <span className="price-period">/month</span>
                    </div>

                    {/* Targeted Programs */}
                    {job.courses && job.courses.length > 0 && (
                      <div className="targeted-courses">
                        <strong>Targeted Programs:</strong>
                        <div style={{ marginTop: '5px' }}>
                          {job.courses.map((course, index) => (
                            <span key={index} className="program-tag">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Description Preview */}
                    <div className="job-description">
                      {job.description && job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description}
                    </div>

                    {/* Actions - Only View Details button */}
                    <div className="property-actions">
                      <button className="btn-edit" onClick={() => viewJobDetails(job)}>
                        <i className="fas fa-eye"></i> View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-properties">
                <div className="no-jobs-content">
                  <i className="fas fa-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                  <p>No job listings found matching your criteria</p>
                </div>
              </div>
            )}
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
        <div className="modal-overlay active" onClick={handleModalClose}>
          <div className="modal admin-modal">
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
                    <span>{selectedJob.company?.companyName || 'Not specified'}</span>
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
                  <h3>Targeted Programs</h3>
                  <div className="departments-list">
                    {selectedJob.courses?.join(', ') || 'No specific programs targeted'}
                  </div>
                </div>

                {selectedJob.status === 'rejected' && selectedJob.rejectionReason && (
                  <div className="detail-section full-width">
                    <h3>Rejection Reason</h3>
                    <div className="rejection-reason">
                      {selectedJob.rejectionReason}
                    </div>
                  </div>
                )}

                {selectedJob.status === 'pending' && (
                  <div className="detail-section full-width">
                    <h3>Coordinator Actions</h3>
                    <div className="admin-action-buttons">
                      <button
                        className="btn-approve-large"
                        onClick={() => approveJob(selectedJob.listingID)}
                        disabled={loading}
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
                          onClick={() => rejectJob(selectedJob.listingID, rejectionReason)}
                          disabled={loading}
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