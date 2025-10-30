import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserCheck,
  faMapMarkerAlt,
  faTrash,
  faChartLine,
  faClock,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersWithReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/users");
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/users/stats");
      const result = await response.json();
      
      if (response.ok && result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityStatus = (lastActive) => {
    if (!lastActive) return 'unknown';
    const lastActiveDate = new Date(lastActive);
    const daysAgo = (new Date() - lastActiveDate) / (1000 * 60 * 60 * 24);
    
    if (daysAgo < 1) return 'today';
    if (daysAgo < 7) return 'week';
    if (daysAgo < 30) return 'month';
    return 'inactive';
  };

  const getActivityBadge = (lastActive) => {
    const status = getActivityStatus(lastActive);
    const statusConfig = {
      today: { class: "bg-success", text: "Active Today" },
      week: { class: "bg-primary", text: "This Week" },
      month: { class: "bg-warning", text: "This Month" },
      inactive: { class: "bg-secondary", text: "Inactive" },
      unknown: { class: "bg-light text-dark", text: "Unknown" }
    };
    const config = statusConfig[status];
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading citizen data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h3 style={style.header}>SmartWaste Nairobi - Citizen Users</h3>
      <p className="text-muted text-center mb-4">
        Mobile app users contributing to cleaner Nairobi
      </p>
      
      {/* Statistics Cards */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-4 col-sm-6 mb-3">
          <div className="card text-white bg-primary">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faUsers} size="2x" className="mb-2" />
              <h5 className="card-title">Total Citizens</h5>
              <h2 className="card-text">{stats.totalUsers}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-sm-6 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faUserCheck} size="2x" className="mb-2" />
              <h5 className="card-title">Active Users</h5>
              <h2 className="card-text">{stats.activeUsers}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-sm-6 mb-3">
          <div className="card text-white bg-info">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faChartLine} size="2x" className="mb-2" />
              <h5 className="card-title">Report Contributors</h5>
              <h2 className="card-text">{stats.usersWithReports}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Citizen Users ({users.length})
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Last Active</th>
                  <th>Activity Status</th>
                  <th>Reports Submitted</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                    </td>
                    <td>
                      {getActivityBadge(user.lastActive)}
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {user.reportsCount || 0} reports
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center text-muted py-4">
              <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
              <p>No citizen users registered yet.</p>
              <p className="small">Users will appear here when they sign up via the mobile app.</p>
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6>
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                About Citizen Users
              </h6>
              <p className="mb-0 small">
                • These are Nairobi residents using the SmartWaste mobile app<br/>
                • They report waste issues in their communities<br/>
                • Active users help identify problem areas faster<br/>
                • Each report contributes to cleaner neighborhoods
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const style = {
  header: {
    textAlign: "center",
    color: "darkgreen",
    fontSize: "24px",
    fontWeight: "bold",
    padding: "10px",
    marginBottom: "10px"
  }
};

export default Users;