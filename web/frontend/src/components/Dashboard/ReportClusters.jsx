import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faExclamationTriangle,
  faClock,
  faCheckCircle,
  faUsers,
  faRoute,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

function ReportClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClusters: 0,
    highPriority: 0,
    needsAttention: 0,
    activeReports: 0
  });

  useEffect(() => {
    loadReportClusters();
  }, []);

  const loadReportClusters = async () => {
    try {
      setLoading(true);
      
      // First, get all reports from backend
      const response = await fetch("http://192.168.2.103:3000/api/reports/all");
      const result = await response.json();
      
      if (response.ok && result.success) {
        const reports = result.reports;
        
        // Group reports into clusters by location (simple clustering)
        const clusterGroups = createClusters(reports);
        setClusters(clusterGroups);
        
        // Calculate statistics
        const totalClusters = clusterGroups.length;
        const highPriority = clusterGroups.filter(cluster => 
          cluster.priority === 'high' || cluster.priority === 'critical'
        ).length;
        const needsAttention = clusterGroups.filter(cluster => 
          cluster.status === 'needs_attention'
        ).length;
        const activeReports = reports.filter(report => 
          report.status === 'submitted' || report.status === 'in-progress'
        ).length;

        setStats({
          totalClusters,
          highPriority,
          needsAttention,
          activeReports
        });
      }
    } catch (error) {
      console.error("Error loading report clusters:", error);
    } finally {
      setLoading(false);
    }
  };

  const createClusters = (reports) => {
    // Simple clustering - group by general location area
    const locationGroups = {};
    
    reports.forEach(report => {
      if (report.status !== 'completed') {
        const locationKey = report.location?.address?.split(',')[0] || 'Unknown Location';
        
        if (!locationGroups[locationKey]) {
          locationGroups[locationKey] = {
            reports: [],
            location: locationKey,
            totalReports: 0,
            urgentCount: 0
          };
        }
        
        locationGroups[locationKey].reports.push(report);
        locationGroups[locationKey].totalReports++;
        
        // Count urgent reports
        const urgency = getUrgencyFromDescription(report.description);
        if (urgency === 'critical' || urgency === 'high') {
          locationGroups[locationKey].urgentCount++;
        }
      }
    });

    // Convert to cluster array with metadata
    return Object.values(locationGroups).map((cluster, index) => {
      const priority = cluster.urgentCount > 2 ? 'critical' : 
                      cluster.urgentCount > 0 ? 'high' : 
                      cluster.totalReports > 3 ? 'medium' : 'low';
                      
      const status = priority === 'critical' ? 'needs_attention' : 
                    cluster.totalReports > 2 ? 'needs_attention' : 'monitoring';

      return {
        id: `CLUSTER-${index + 1}`,
        location: cluster.location,
        reportCount: cluster.totalReports,
        urgentCount: cluster.urgentCount,
        priority: priority,
        status: status,
        lastReport: cluster.reports[0]?.createdAt,
        reports: cluster.reports
      };
    });
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      critical: { class: "bg-danger", text: "Critical" },
      high: { class: "bg-warning", text: "High" },
      medium: { class: "bg-info", text: "Medium" },
      low: { class: "bg-secondary", text: "Low" }
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      needs_attention: "bg-warning",
      monitoring: "bg-success",
      in_progress: "bg-primary",
      completed: "bg-info"
    };
    const configClass = statusConfig[status] || "bg-secondary";
    const displayText = status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return <span className={`badge ${configClass}`}>{displayText}</span>;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleAssignRoute = (clusterId) => {
    alert(`Route assignment for ${clusterId} - This would integrate with route optimization in Phase 2`);
    // Future: Integrate with route optimization system
  };

  const handleViewDetails = (cluster) => {
    alert(`Cluster Details:\nLocation: ${cluster.location}\nReports: ${cluster.reportCount}\nUrgent: ${cluster.urgentCount}\nPriority: ${cluster.priority}`);
    // Future: Show detailed modal with all reports in this cluster
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Analyzing citizen reports and creating clusters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h3 style={style.header}>SmartWaste Nairobi - Report Clusters</h3>
      <p className="text-muted text-center mb-4">
        Dynamic clusters based on real-time citizen reports
      </p>
      
      {/* Statistics Cards */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-primary">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" className="mb-2" />
              <h5 className="card-title">Total Clusters</h5>
              <h2 className="card-text">{stats.totalClusters}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-warning">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2" />
              <h5 className="card-title">Needs Attention</h5>
              <h2 className="card-text">{stats.needsAttention}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-danger">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faUsers} size="2x" className="mb-2" />
              <h5 className="card-title">High Priority</h5>
              <h2 className="card-text">{stats.highPriority}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-white bg-info">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faTrash} size="2x" className="mb-2" />
              <h5 className="card-title">Active Reports</h5>
              <h2 className="card-text">{stats.activeReports}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Clusters Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Citizen Report Clusters
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Cluster ID</th>
                      <th>Location</th>
                      <th>Total Reports</th>
                      <th>Urgent Reports</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Last Report</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clusters.map((cluster) => (
                      <tr key={cluster.id} style={style.tableRow}>
                        <td>
                          <strong>{cluster.id}</strong>
                        </td>
                        <td>
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                          {cluster.location}
                        </td>
                        <td>
                          <span className="badge bg-primary">{cluster.reportCount}</span>
                        </td>
                        <td>
                          {cluster.urgentCount > 0 ? (
                            <span className="badge bg-danger">{cluster.urgentCount} urgent</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>{getPriorityBadge(cluster.priority)}</td>
                        <td>{getStatusBadge(cluster.status)}</td>
                        <td>{cluster.lastReport ? formatTimeAgo(cluster.lastReport) : 'N/A'}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleAssignRoute(cluster.id)}
                          >
                            <FontAwesomeIcon icon={faRoute} className="me-1" />
                            Assign Route
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewDetails(cluster)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {clusters.length === 0 && (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" className="mb-3" />
                  <p>No report clusters found. Citizen reports will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6>
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                How Report Clusters Work
              </h6>
              <p className="mb-0 small">
                • Clusters are automatically created when multiple citizens report issues in the same area<br/>
                • Priority is determined by the number and urgency of reports<br/>
                • Collection routes can be assigned to handle multiple reports efficiently<br/>
                • System updates in real-time as new reports are submitted
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
  },
  tableRow: {
    transition: "background-color 0.2s ease"
  }
};

export default ReportClusters;