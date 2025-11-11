import React, { useState, useEffect } from "react";
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
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);

  const depots = [
    { id: 'depot-east', name: 'East Nairobi Depot', location: [-1.2800, 36.8700] },
    { id: 'depot-central', name: 'Central Depot', location: [-1.286389, 36.817223] },
    { id: 'depot-west', name: 'West Nairobi Depot', location: [-1.2700, 36.8000] }
  ];
  const [selectedDepot, setSelectedDepot] = useState(depots[0].id);

  useEffect(() => {
    loadReportClusters();
  }, []);

  const loadReportClusters = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      if (response.ok && result.success) {
        const reports = result.reports;
        const clusterGroups = createGeographicClusters(reports);
        setClusters(clusterGroups);
        
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

  const createGeographicClusters = (reports, maxDistanceMeters = 200) => {
    const activeReports = reports.filter(report => 
      report.status !== 'completed' && 
      report.latitude && 
      report.longitude
    );

    if (activeReports.length === 0) {
      return [];
    }

    const clusters = [];
    const visited = new Set();
    
    // Convert meters to degrees (approximate)
    const maxDistanceDegrees = maxDistanceMeters / 111000;

    activeReports.forEach((report, index) => {
      if (visited.has(index)) return;

      const cluster = {
        reports: [report],
        center: [report.latitude, report.longitude],
        totalReports: 1,
        urgentCount: 0
      };

      visited.add(index);

      // Calculate urgency for the first report
      const urgency = getUrgencyFromDescription(report.description);
      if (urgency === 'critical' || urgency === 'high') {
        cluster.urgentCount++;
      }

      // Find nearby reports using the same logic as MapView
      activeReports.forEach((otherReport, otherIndex) => {
        if (!visited.has(otherIndex) && index !== otherIndex) {
          const distance = Math.sqrt(
            Math.pow(otherReport.latitude - report.latitude, 2) + 
            Math.pow(otherReport.longitude - report.longitude, 2)
          );

          if (distance <= maxDistanceDegrees) {
            cluster.reports.push(otherReport);
            visited.add(otherIndex);
            cluster.totalReports++;
            
            // Update center to average of all reports
            cluster.center = [
              cluster.reports.reduce((sum, r) => sum + r.latitude, 0) / cluster.reports.length,
              cluster.reports.reduce((sum, r) => sum + r.longitude, 0) / cluster.reports.length
            ];

            // Update urgency count
            const otherUrgency = getUrgencyFromDescription(otherReport.description);
            if (otherUrgency === 'critical' || otherUrgency === 'high') {
              cluster.urgentCount++;
            }
          }
        }
      });

      // Use the same location detection as your other components
      const locationName = getBestLocationName(cluster.reports);
      
      // Determine priority and status
      const priority = cluster.urgentCount > 2 ? 'critical' : 
                      cluster.urgentCount > 0 ? 'high' : 
                      cluster.totalReports > 3 ? 'medium' : 'low';
                      
      const status = priority === 'critical' ? 'needs_attention' : 
                    cluster.totalReports > 2 ? 'needs_attention' : 'monitoring';

      clusters.push({
        id: `CLUSTER-${clusters.length + 1}`,
        location: locationName,
        reportCount: cluster.totalReports,
        urgentCount: cluster.urgentCount,
        priority: priority,
        status: status,
        lastReport: cluster.reports[0]?.createdAt,
        reports: cluster.reports,
        center: cluster.center
      });
    });

    return clusters;
  };

  const getBestLocationName = (reports) => {
    // Use the exact same location logic as MapView
    // Try report.location.address first (most common)
    const address = reports[0]?.location?.address;
    if (address && address !== 'Nairobi' && !address.includes('Unknown')) {
      return address.split(',')[0]?.trim();
    }
    
    // Try report.address as fallback
    const directAddress = reports[0]?.address;
    if (directAddress && directAddress !== 'Nairobi' && !directAddress.includes('Unknown')) {
      return directAddress.split(',')[0]?.trim();
    }
    
    // Final fallback to area-based naming
    const centerLat = reports.reduce((sum, r) => sum + r.latitude, 0) / reports.length;
    if (centerLat < -1.28) return 'South Nairobi';
    if (centerLat > -1.25) return 'North Nairobi';
    return 'Central Nairobi';
  };

  const getUrgencyFromDescription = (description) => {
    if (!description) return 'medium';
    
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

  const handleClusterSelect = (clusterId) => {
    setSelectedClusters(prev => {
      if (prev.includes(clusterId)) {
        return prev.filter(id => id !== clusterId);
      } else {
        return [...prev, clusterId];
      }
    });
  };

  const handleOptimizeRoutes = async () => {
    if (selectedClusters.length === 0) {
      alert("Please select at least one cluster");
      return;
    }

    try {
      setRouteLoading(true);
      const selectedDepotObj = depots.find(d => d.id === selectedDepot);

      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/optimization/optimize-routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clusterIds: selectedClusters,
          depotLocation: selectedDepotObj.location
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setOptimizedRoutes(result.optimizedRoutes);
        setShowRouteModal(true);
      }
    } catch (error) {
      console.error("Error optimizing routes:", error);
      alert("Error optimizing routes");
    } finally {
      setRouteLoading(false);
    }
  };

  const handleAssignRoute = (clusterId) => {
    setSelectedClusters([clusterId]);
    handleOptimizeRoutes();
  };

  const handleViewDetails = (cluster) => {
    alert(`Cluster Details:\nLocation: ${cluster.location}\nReports: ${cluster.reportCount}\nUrgent: ${cluster.urgentCount}\nPriority: ${cluster.priority}\nCoordinates: ${cluster.center[0].toFixed(6)}, ${cluster.center[1].toFixed(6)}`);
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
      <h3 style={style.header}>Report Clusters</h3>
      <p className="text-muted text-center mb-4">
        Dynamic clusters based on citizen reports
      </p>
      
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

      {selectedClusters.length > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <div>
            <strong>{selectedClusters.length} clusters selected</strong>
            <div className="mt-2">
              <select 
                value={selectedDepot}
                onChange={(e) => setSelectedDepot(e.target.value)}
                className="form-select form-select-sm"
                style={{width: '200px'}}
              >
                {depots.map(depot => (
                  <option key={depot.id} value={depot.id}>
                    {depot.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button 
              className="btn btn-success me-2"
              onClick={handleOptimizeRoutes}
              disabled={routeLoading}
            >
              {routeLoading ? 'Optimizing...' : '🚀 Optimize Routes'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedClusters([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Citizen Report Clusters
              </h5>
              <small>Select multiple clusters for route optimization</small>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClusters(clusters.map(c => c.id));
                            } else {
                              setSelectedClusters([]);
                            }
                          }}
                          checked={selectedClusters.length === clusters.length}
                        />
                      </th>
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
                          <input 
                            type="checkbox"
                            checked={selectedClusters.includes(cluster.id)}
                            onChange={() => handleClusterSelect(cluster.id)}
                          />
                        </td>
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

      {showRouteModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">🚛 Optimized Collection Routes</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowRouteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {optimizedRoutes.length > 0 ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Optimized Routes ({optimizedRoutes.length})</h6>
                      {optimizedRoutes.map((route, index) => (
                        <div key={route.id} className="card mb-3">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <strong>{route.name}</strong>
                            <span className="badge bg-primary">{route.totalStops} stops</span>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-6">
                                <small>Distance: {route.distance}km</small>
                              </div>
                              <div className="col-6">
                                <small>Time: {route.estimatedTime}min</small>
                              </div>
                            </div>
                            <div className="mt-2">
                              <small><strong>Stops:</strong></small>
                              <div>
                                {route.clusters.map((cluster, idx) => (
                                  <span key={idx} className="badge bg-secondary me-1">
                                    {idx + 1}. {cluster.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button className="btn btn-success btn-sm mt-2 w-100">
                              Assign to Collector
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <strong>Route Visualization</strong>
                        </div>
                        <div className="card-body">
                          <div style={{
                            height: '300px',
                            background: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px'
                          }}>
                            <div className="text-center text-muted">
                              <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" />
                              <p className="mt-2">Map visualization would appear here</p>
                              <small>Showing {optimizedRoutes.reduce((sum, r) => sum + r.totalStops, 0)} total stops</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p>No optimized routes generated</p>
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