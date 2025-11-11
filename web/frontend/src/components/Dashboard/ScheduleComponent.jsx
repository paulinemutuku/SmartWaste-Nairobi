import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faRoute, 
  faCalendar,
  faUser,
  faCheckCircle,
  faClock
} from "@fortawesome/free-solid-svg-icons";

function ScheduleComponent() {
  const [clusters, setClusters] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedCollector, setSelectedCollector] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedRoutes, setAssignedRoutes] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load REAL clusters from ReportClusters API
      const [clustersRes, collectorsRes, schedulesRes] = await Promise.all([
        fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all"),
        fetch("https://smart-waste-nairobi-chi.vercel.app/api/collectors"),
        fetch("https://smart-waste-nairobi-chi.vercel.app/api/schedules")
      ]);

      const clustersData = await clustersRes.json();
      const collectorsData = await collectorsRes.json();
      const schedulesData = await schedulesRes.json();

      if (clustersData.success) {
        // Use the same clustering logic as ReportClusters
        const realClusters = createGeographicClusters(clustersData.reports);
        setClusters(realClusters);
      }

      if (collectorsData.success) {
        setCollectors(collectorsData.collectors);
        
        // Load assigned routes from all collectors
        loadAllAssignedRoutes(collectorsData.collectors);
      }

      if (schedulesData.success) {
        setSchedules(schedulesData.schedules);
      }

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllAssignedRoutes = async (collectorsList) => {
    try {
      const routes = [];
      
      for (const collector of collectorsList) {
        const response = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collector._id}/routes`);
        const result = await response.json();
        
        if (result.success && result.routes) {
          result.routes.forEach(route => {
            routes.push({
              ...route,
              collectorName: collector.name,
              collectorId: collector._id
            });
          });
        }
      }
      
      setAssignedRoutes(routes);
    } catch (error) {
      console.error("Error loading assigned routes:", error);
    }
  };

  const createGeographicClusters = (reports, maxDistanceMeters = 200) => {
    const activeReports = reports.filter(report => 
      report.status !== 'completed' && 
      report.latitude && 
      report.longitude
    );

    if (activeReports.length === 0) return [];

    const clusters = [];
    const visited = new Set();
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

      const urgency = getUrgencyFromDescription(report.description);
      if (urgency === 'critical' || urgency === 'high') cluster.urgentCount++;

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
            
            cluster.center = [
              cluster.reports.reduce((sum, r) => sum + r.latitude, 0) / cluster.reports.length,
              cluster.reports.reduce((sum, r) => sum + r.longitude, 0) / cluster.reports.length
            ];

            const otherUrgency = getUrgencyFromDescription(otherReport.description);
            if (otherUrgency === 'critical' || otherUrgency === 'high') cluster.urgentCount++;
          }
        }
      });

      const locationName = getBestLocationName(cluster.reports);
      
      clusters.push({
        id: `CLUSTER-${clusters.length + 1}`,
        name: locationName,
        location: locationName,
        reports: cluster.reports,
        center: cluster.center,
        reportCount: cluster.totalReports,
        urgentCount: cluster.urgentCount
      });
    });

    return clusters;
  };

  const getBestLocationName = (reports) => {
    for (let report of reports) {
      const address = report?.location?.address;
      if (address && address !== 'Nairobi' && !address.includes('Unknown')) {
        const cleanAddress = address.split(',')[0]?.trim();
        if (cleanAddress && cleanAddress.length > 3) return cleanAddress;
      }
    }
    return `Collection Zone ${Math.floor(Math.random() * 100) + 1}`;
  };

  const getUrgencyFromDescription = (description) => {
    if (!description) return 'medium';
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('overflow') || lowerDesc.includes('block') || lowerDesc.includes('emergency')) return 'critical';
    if (lowerDesc.includes('full') || lowerDesc.includes('urgent')) return 'high';
    return 'medium';
  };

  const createSchedule = async () => {
    if (!selectedCluster || !selectedCollector || !scheduleDate) {
      alert("Please select cluster, collector, and date");
      return;
    }

    try {
      const cluster = clusters.find(c => c.id === selectedCluster);
      const collector = collectors.find(c => c._id === selectedCollector);

      // 1. Create schedule
      const scheduleData = {
        clusterId: selectedCluster,
        clusterName: cluster.name,
        collectorId: selectedCollector,
        collectorName: collector.name,
        date: scheduleDate,
        reportCount: cluster.reportCount,
        status: 'scheduled'
      };

      const scheduleResponse = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData)
      });

      const scheduleResult = await scheduleResponse.json();
      
      if (scheduleResult.success) {
        // 2. Assign route to collector with GPS data
        const routeAssignment = {
          routeId: `route-${Date.now()}`,
          clusterId: selectedCluster,
          clusterName: cluster.name,
          clusterLocation: cluster.location,
          gpsCoordinates: cluster.center, // [lat, lng] for mobile app navigation
          assignedDate: new Date(),
          scheduledDate: scheduleDate,
          status: 'scheduled',
          reportCount: cluster.reportCount,
          notes: `Scheduled collection for ${cluster.name} - ${cluster.reportCount} reports`,
          // Mobile app will use these for Uber-like navigation:
          pickupLocation: cluster.location,
          destinationCoordinates: cluster.center,
          estimatedTime: "30-45 min", // Could be calculated based on distance
          distance: "2-5 km" // Could be calculated
        };

        const routeResponse = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/collectors/${selectedCollector}/assign-route`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(routeAssignment)
        });

        const routeResult = await routeResponse.json();
        
        if (routeResult.success) {
          alert(`✅ Schedule created! ${collector.name} can now see this route in their mobile app with GPS navigation.`);
          
          // Refresh data
          setSelectedCluster("");
          setSelectedCollector("");
          setScheduleDate("");
          loadAllData();
        }
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert("❌ Error creating schedule");
    }
  };

  const completeSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/schedules/${scheduleId}/complete`, {
        method: "PUT"
      });

      const result = await response.json();
      
      if (result.success) {
        // Also update the route status in collector
        const schedule = schedules.find(s => s._id === scheduleId);
        if (schedule) {
          await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/collectors/${schedule.collectorId}/routes/${scheduleId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: 'completed' })
          });
        }
        
        alert("✅ Schedule marked as completed!");
        loadAllData();
      }
    } catch (error) {
      console.error("Error completing schedule:", error);
    }
  };

  const calculateOptimalDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const activeClusters = clusters.filter(cluster => 
    !schedules.some(schedule => schedule.clusterId === cluster.id && schedule.status !== 'completed')
  );

  const openGoogleMaps = (coordinates) => {
    const [lat, lng] = coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "50vh"}}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3">Loading smart scheduling system...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-success text-white py-3">
          <h4 className="mb-0 fw-bold">
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            Smart Collection Schedule & Assignment Hub
          </h4>
        </div>
      </div>

      <div className="row">
        {/* Schedule Creation Panel */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-success text-white py-3">
              <h5 className="mb-0">📋 Assign Collection Route</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Select Cluster:
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Cluster --</option>
                  {activeClusters.map((cluster) => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.name} ({cluster.reportCount} reports)
                    </option>
                  ))}
                </select>
                {activeClusters.length === 0 && (
                  <div className="alert alert-info mt-2">
                    <small>✅ All clusters assigned! New reports will create new clusters.</small>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Assign to Collector:
                </label>
                <select
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Collector --</option>
                  {collectors.filter(c => c.activeAccount).map((collector) => (
                    <option key={collector._id} value={collector._id}>
                      {collector.name} - {collector.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faCalendar} className="me-2" />
                  Collection Date:
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={calculateOptimalDate()}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="form-control"
                />
                <small className="text-muted">Recommended: {calculateOptimalDate()}</small>
              </div>

              <button
                onClick={createSchedule}
                disabled={!selectedCluster || !selectedCollector || !scheduleDate || activeClusters.length === 0}
                className="btn btn-success w-100 btn-lg"
              >
                🚀 Assign Route to Collector
              </button>

              {selectedCluster && (
                <div className="mt-3 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Mobile App Features:</strong><br/>
                    • 📍 GPS navigation to collection site<br/>
                    • 🗺️ Google Maps integration<br/>
                    • ⏱️ Estimated time & distance<br/>
                    • 📋 Collection instructions
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Routes & Schedules */}
        <div className="col-lg-8">
          {/* Assigned Routes */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white py-3">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faRoute} className="me-2" />
                Active Routes in Mobile App ({assignedRoutes.length})
              </h5>
            </div>
            <div className="card-body">
              {assignedRoutes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Collector</th>
                        <th>Location</th>
                        <th>Reports</th>
                        <th>Status</th>
                        <th>Schedule Date</th>
                        <th>Navigation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedRoutes.map((route) => (
                        <tr key={route._id}>
                          <td>
                            <strong>{route.collectorName}</strong>
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                            {route.clusterName}
                          </td>
                          <td>
                            <span className="badge bg-primary">{route.reportCount}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              route.status === 'completed' ? 'bg-success' : 
                              route.status === 'in-progress' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {route.status}
                            </span>
                          </td>
                          <td>
                            {new Date(route.scheduledDate).toLocaleDateString('en-KE')}
                          </td>
                          <td>
                            <button
                              onClick={() => openGoogleMaps(route.gpsCoordinates || route.destinationCoordinates)}
                              className="btn btn-sm btn-outline-primary"
                              title="Open in Google Maps"
                            >
                              <FontAwesomeIcon icon={faRoute} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" className="mb-3" />
                  <h5>No routes assigned yet</h5>
                  <p>Assign routes to collectors using the form on the left</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-primary border-0">
                <div className="card-body text-center">
                  <h5>Available Clusters</h5>
                  <h2>{activeClusters.length}</h2>
                  <small>Ready for assignment</small>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-warning border-0">
                <div className="card-body text-center">
                  <h5>Active Routes</h5>
                  <h2>{assignedRoutes.filter(r => r.status === 'scheduled').length}</h2>
                  <small>In mobile app</small>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-success border-0">
                <div className="card-body text-center">
                  <h5>Completed</h5>
                  <h2>{assignedRoutes.filter(r => r.status === 'completed').length}</h2>
                  <small>Collections done</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleComponent;