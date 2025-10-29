import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ScheduleComponent() {
  const [clusters, setClusters] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedCollector, setSelectedCollector] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [reportsRes, collectorsRes] = await Promise.all([
        fetch("http://192.168.2.103:3000/api/reports/all"),
        fetch("http://192.168.2.103:3000/api/collectors")
      ]);

      const reportsData = await reportsRes.json();
      const collectorsData = await collectorsRes.json();

      if (reportsData.success) {
        setReports(reportsData.reports);
        const clustersData = createSmartClusters(reportsData.reports);
        setClusters(clustersData);
      }

      if (collectorsData.success) {
        setCollectors(collectorsData.collectors);
      }

      loadSchedules();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSmartClusters = (reports) => {
    const reportsWithLocation = reports.filter(report => 
      report.location?.latitude && report.location?.longitude
    );
    
    const clusterMap = new Map();
    
    reportsWithLocation.forEach((report) => {
      const area = report.location?.address?.split(',')[0] || 'Nairobi';
      if (!clusterMap.has(area)) {
        clusterMap.set(area, {
          id: area,
          name: area,
          reports: [],
          center: [report.location.latitude, report.location.longitude],
          reportCount: 0,
          urgency: 'pending'
        });
      }
      
      const cluster = clusterMap.get(area);
      cluster.reports.push(report);
      cluster.reportCount = cluster.reports.length;
    });

    return Array.from(clusterMap.values());
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch("http://192.168.2.103:3000/api/schedules");
      const result = await response.json();
      if (result.success) {
        setSchedules(result.schedules);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
    }
  };

  const createSchedule = async () => {
    if (!selectedCluster || !selectedCollector || !scheduleDate) {
      alert("Please select cluster, collector, and date");
      return;
    }

    try {
      const cluster = clusters.find(c => c.id === selectedCluster);
      const collector = collectors.find(c => c._id === selectedCollector);

      const scheduleData = {
        clusterId: selectedCluster,
        clusterName: cluster.name,
        collectorId: selectedCollector,
        collectorName: collector.name,
        date: scheduleDate,
        reportCount: cluster.reportCount,
        status: 'scheduled'
      };

      const response = await fetch("http://192.168.2.103:3000/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert("✅ Schedule created successfully!");
        setSelectedCluster("");
        setSelectedCollector("");
        setScheduleDate("");
        loadSchedules();
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert("❌ Error creating schedule");
    }
  };

  const completeSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`http://192.168.2.103:3000/api/schedules/${scheduleId}/complete`, {
        method: "PUT"
      });

      const result = await response.json();
      
      if (result.success) {
        alert("✅ Schedule marked as completed!");
        loadSchedules();
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "50vh"}}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading smart schedule...</span>
        </div>
        <p className="ms-3">Loading smart scheduling system...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">🗓️ Smart Collection Schedule</h4>
          <small>Intelligent route planning based on citizen reports</small>
        </div>
      </div>

      <div className="row">
        {/* Schedule Creation Panel */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Create New Schedule</h5>
            </div>
            <div className="card-body">
              {/* Cluster Selection */}
              <div className="mb-3">
                <label className="form-label fw-bold">Select Report Cluster:</label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Cluster --</option>
                  {clusters.map((cluster) => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.name} ({cluster.reportCount} reports)
                    </option>
                  ))}
                </select>
              </div>

              {/* Collector Selection */}
              <div className="mb-3">
                <label className="form-label fw-bold">Assign Collector:</label>
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

              {/* Date Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">Schedule Date:</label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={calculateOptimalDate()}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="form-control"
                />
                <small className="text-muted">Recommended: {calculateOptimalDate()}</small>
              </div>

              {/* Create Schedule Button */}
              <button
                onClick={createSchedule}
                disabled={!selectedCluster || !selectedCollector || !scheduleDate}
                className="btn btn-success w-100 btn-lg"
              >
                🚀 Create Smart Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Active Schedules */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">📊 Active Collection Schedules</h5>
            </div>
            <div className="card-body">
              {schedules.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Collector</th>
                        <th>Area</th>
                        <th>Reports</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule._id}>
                          <td>
                            <strong>{new Date(schedule.date).toLocaleDateString('en-KE')}</strong>
                          </td>
                          <td>{schedule.collectorName}</td>
                          <td>{schedule.clusterName}</td>
                          <td>
                            <span className="badge bg-primary">{schedule.reportCount}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              schedule.status === 'completed' ? 'bg-success' : 
                              schedule.status === 'in-progress' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {schedule.status}
                            </span>
                          </td>
                          <td>
                            {schedule.status === 'scheduled' && (
                              <button
                                onClick={() => completeSchedule(schedule._id)}
                                className="btn btn-success btn-sm"
                              >
                                Mark Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <h5>No active schedules</h5>
                  <p>Create your first smart schedule above</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-white bg-primary">
                <div className="card-body text-center">
                  <h5>Active Clusters</h5>
                  <h2>{clusters.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-warning">
                <div className="card-body text-center">
                  <h5>Available Collectors</h5>
                  <h2>{collectors.filter(c => c.activeAccount).length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-success">
                <div className="card-body text-center">
                  <h5>Total Reports</h5>
                  <h2>{reports.length}</h2>
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