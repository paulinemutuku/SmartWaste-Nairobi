import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faUsers, 
  faMapMarkerAlt, 
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faSync
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  const [dashboardData, setDashboardData] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    criticalReports: 0,
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadMobileReports();
    
    const interval = setInterval(() => {
      loadMobileReports();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadMobileReports = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      if (response.ok && result.success) {
        const reports = result.reports;
        
        const transformedReports = reports.map(report => ({
          id: report._id,
          type: "citizen_report",
          description: report.description,
          urgency: report.priority || 'pending', 
          status: report.status === 'submitted' ? 'pending' : 
                  report.status === 'in-progress' ? 'assigned' : 
                  report.status === 'completed' ? 'completed' : 'pending',
          location: report.location || 'Nairobi',
          submittedAt: report.createdAt,
          images: report.photo ? [report.photo] : []
        }));

        const totalReports = reports.length;
        const pendingReports = reports.filter(r => r.status === 'submitted').length;
        const completedReports = reports.filter(r => r.status === 'completed').length;
        const criticalReports = reports.filter(r => 
          getUrgencyFromDescription(r.description) === 'critical'
        ).length;

        setDashboardData({
          totalReports,
          pendingReports,
          completedReports,
          criticalReports,
          recentReports: transformedReports.slice(0, 10)
        });

        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error loading mobile reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyFromDescription = (description) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('overflow') || lowerDesc.includes('block') || lowerDesc.includes('emergency')) {
      return 'critical';
    } else if (lowerDesc.includes('full') || lowerDesc.includes('urgent')) {
      return 'high';
    } else {
      return 'medium';
    }
  };

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
      assigned: "bg-primary", 
      completed: "bg-success",
      verified: "bg-info"
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

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading real-time reports from citizens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={style.header}>SmartWaste Nairobi - Live Dashboard</h3>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={loadMobileReports}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} className={loading ? "fa-spin" : ""} />
          {loading ? " Refreshing..." : " Refresh"}
        </button>
      </div>

      {lastUpdated && (
        <div className="alert alert-info">
          <small>Last updated: {lastUpdated.toLocaleTimeString()}</small>
        </div>
      )}
      
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

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Live Citizen Reports
              </h5>
              <span className="badge bg-primary">{dashboardData.recentReports.length} reports</span>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Report ID</th>
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
                          <strong>RPT-{report.id.slice(-4)}</strong>
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
                  <p>No citizen reports yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  <h6 className="text-muted">Active Reports</h6>
                  <h4 className="text-info">{dashboardData.pendingReports}</h4>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Data Source</h6>
                  <h4 className="text-primary">Mobile App</h4>
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