import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faUsers, 
  faMapMarkerAlt, 
  faExclamationTriangle,
  faCheckCircle,
  faClock
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  const [dashboardData, setDashboardData] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    criticalReports: 0,
    recentReports: []
  });

  const mockDashboardData = {
    totalReports: 47,
    pendingReports: 12,
    completedReports: 28,
    criticalReports: 7,
    recentReports: [
      {
        id: "RPT-047",
        type: "illegal_dump",
        description: "Dumping in Mathare River",
        urgency: "critical",
        status: "pending",
        location: "Mathare",
        submittedAt: new Date(Date.now() - 30 * 60000).toISOString() // 30 mins ago
      },
      {
        id: "RPT-046", 
        type: "full_bin",
        description: "Market bin overflowing",
        urgency: "high",
        status: "verified", 
        location: "Gikomba Market",
        submittedAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
      },
      {
        id: "RPT-045",
        type: "illegal_dump",
        description: "Construction waste on road",
        urgency: "medium",
        status: "completed",
        location: "Kilimani",
        submittedAt: new Date(Date.now() - 5 * 3600000).toISOString() // 5 hours ago
      }
    ]
  };

  useEffect(() => {
    fetch("http://localhost:1337/api/user-details")
      .then((response) => response.json())
      .then((data) => {
        console.log("Users data:", data);
      })
      .catch((error) => console.error("Error:", error));

    fetch("http://localhost:1337/api/bins")
      .then((response) => response.json())
      .then((data) => {
        console.log("Bins data:", data);
      })
      .catch((error) => console.error("Error:", error));

    fetch("http://localhost:1337/api/collector-details")
      .then((response) => response.json())
      .then((data) => {
        console.log("Collectors data:", data);
      })
      .catch((error) => console.error("Error:", error));

    setDashboardData(mockDashboardData);
  }, []);

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      critical: { class: "bg-danger", icon: faExclamationTriangle },
      high: { class: "bg-warning", icon: faExclamationTriangle },
      medium: { class: "bg-info", icon: faClock },
      low: { class: "bg-secondary", icon: faClock }
    };
    const config = urgencyConfig[urgency] || urgencyConfig.medium;
    return (
      <span className={`badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} className="me-1" />
        {urgency}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-warning",
      verified: "bg-primary", 
      completed: "bg-success",
      assigned: "bg-info"
    };
    return <span className={`badge ${statusConfig[status]}`}>{status}</span>;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-KE');
    }
  };

  return (
    <div className="container-fluid">
      <h3 style={style.header}>SmartWaste Nairobi - Dashboard</h3>
      
      {/* Statistics Cards */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-primary">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faTrash} size="2x" className="mb-2" />
              <h5 className="card-title">Total Reports</h5>
              <h2 className="card-text">{dashboardData.totalReports}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-warning">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faClock} size="2x" className="mb-2" />
              <h5 className="card-title">Pending</h5>
              <h2 className="card-text">{dashboardData.pendingReports}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" className="mb-2" />
              <h5 className="card-title">Completed</h5>
              <h2 className="card-text">{dashboardData.completedReports}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-danger">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2" />
              <h5 className="card-title">Critical</h5>
              <h2 className="card-text">{dashboardData.criticalReports}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Recent Citizen Reports
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Location</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentReports.map((report) => (
                      <tr key={report.id} style={style.tableRow}>
                        <td>
                          <strong>{report.id}</strong>
                        </td>
                        <td>
                          <span className="text-capitalize">
                            {report.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{report.description}</td>
                        <td>
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                          {report.location}
                        </td>
                        <td>{getUrgencyBadge(report.urgency)}</td>
                        <td>{getStatusBadge(report.status)}</td>
                        <td>{formatTimeAgo(report.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {dashboardData.recentReports.length === 0 && (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faTrash} size="3x" className="mb-3" />
                  <p>No recent reports available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card bg-light">
            <div className="card-body text-center">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-muted">Response Rate</h6>
                  <h4 className="text-success">
                    {dashboardData.totalReports > 0 
                      ? Math.round((dashboardData.completedReports / dashboardData.totalReports) * 100) 
                      : 0}%
                  </h4>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Avg. Response Time</h6>
                  <h4 className="text-info">~4.2 hours</h4>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Coverage Areas</h6>
                  <h4 className="text-primary">8/15 Wards</h4>
                </div>
              </div>
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
    marginBottom: "20px"
  },
  tableRow: {
    transition: "background-color 0.2s ease"
  }
};

export default Home;