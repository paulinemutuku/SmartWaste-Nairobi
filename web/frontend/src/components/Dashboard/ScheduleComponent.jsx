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

  const mockClusters = [
    {
      id: "dandora-cluster",
      name: "Dandora Area",
      reports: [
        { _id: "mock-1", description: "Full bins near Dandora Market", address: "Dandora Market, Nairobi" },
        { _id: "mock-2", description: "Illegal dumping site", address: "Dandora Market Backside" }
      ],
      center: [-1.2600, 36.8900],
      reportCount: 2,
      urgency: "high"
    },
    {
      id: "kayole-cluster", 
      name: "Kayole Area",
      reports: [
        { _id: "mock-3", description: "Full bins in Kayole Estate", address: "Kayole Estate, Nairobi" },
        { _id: "mock-4", description: "Illegal dumping near shopping center", address: "Kayole Shopping Center" }
      ],
      center: [-1.2750, 36.9100],
      reportCount: 2,
      urgency: "medium"
    }
  ];

  const mockCollectors = [
    { _id: "collector-1", name: "John Kamau", zone: "East Nairobi", activeAccount: true },
    { _id: "collector-2", name: "Mary Wanjiku", zone: "Central Nairobi", activeAccount: true },
    { _id: "collector-3", name: "James Omondi", zone: "West Nairobi", activeAccount: true }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      let realClusters = [];
      let realCollectors = [];
      
      try {
        const [reportsRes, collectorsRes] = await Promise.all([
          fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all"),
          fetch("https://smart-waste-nairobi-chi.vercel.app/api/collectors")
        ]);

        const reportsData = await reportsRes.json();
        const collectorsData = await collectorsRes.json();

        if (reportsData.success && reportsData.reports.length > 0) {
          setReports(reportsData.reports);
          realClusters = createSmartClusters(reportsData.reports);
        }

        if (collectorsData.success && collectorsData.collectors.length > 0) {
          realCollectors = collectorsData.collectors;
        }
      } catch (error) {
        console.log("Using mock data for demonstration");
      }

      const finalClusters = realClusters.length > 0 ? realClusters : mockClusters;
      const finalCollectors = realCollectors.length > 0 ? realCollectors : mockCollectors;

      setClusters(finalClusters);
      setCollectors(finalCollectors);
      
      loadSchedules();
    } catch (error) {
      console.error("Error loading data:", error);
      setClusters(mockClusters);
      setCollectors(mockCollectors);
    } finally {
      setLoading(false);
    }
  };

  const createSmartClusters = (reports) => {
    const reportsWithLocation = reports.filter(report => 
      (report.latitude && report.longitude) || 
      (report.location?.latitude && report.location?.longitude)
    );

    if (reportsWithLocation.length === 0) {
      return mockClusters; 
    }

    const clusters = [];
    const usedReports = new Set();
    
    const maxDistance = 0.001;

    reportsWithLocation.forEach((report, index) => {
      if (usedReports.has(index)) return;

      const lat1 = report.latitude || report.location?.latitude;
      const lon1 = report.longitude || report.location?.longitude;
      
      const cluster = {
        id: `cluster-${clusters.length + 1}`,
        name: `Collection Zone ${clusters.length + 1}`,
        reports: [report],
        center: [lat1, lon1],
        reportCount: 1,
        urgency: 'pending'
      };

      usedReports.add(index);

      reportsWithLocation.forEach((otherReport, otherIndex) => {
        if (!usedReports.has(otherIndex) && index !== otherIndex) {
          const lat2 = otherReport.latitude || otherReport.location?.latitude;
          const lon2 = otherReport.longitude || otherReport.location?.longitude;
          
          const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
          
          if (distance <= maxDistance) {
            cluster.reports.push(otherReport);
            usedReports.add(otherIndex);
            
            cluster.center = [
              cluster.reports.reduce((sum, r) => sum + (r.latitude || r.location?.latitude), 0) / cluster.reports.length,
              cluster.reports.reduce((sum, r) => sum + (r.longitude || r.location?.longitude), 0) / cluster.reports.length
            ];
          }
        }
      });

      cluster.reportCount = cluster.reports.length;
      
      const firstReport = cluster.reports[0];
      const address = firstReport.address || firstReport.location?.address;
      if (address && address !== 'Nairobi') {
        const areaName = address.split(',')[0]?.trim();
        if (areaName && areaName !== 'Nairobi') {
          cluster.name = `${areaName} Area`;
        }
      }

      clusters.push(cluster);
    });

    return clusters.length > 0 ? clusters : mockClusters;
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/schedules");
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

      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert("✅ Schedule created successfully!");
        
        setClusters(prev => prev.filter(cluster => cluster.id !== selectedCluster));
        
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
      const response = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/schedules/${scheduleId}/complete`, {
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

  const activeClusters = clusters.filter(cluster => 
    !schedules.some(schedule => schedule.clusterId === cluster.id && schedule.status !== 'completed')
  );

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
      {/* Simplified Header */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-success text-white py-3">
          <h4 className="mb-0 fw-bold">Smart Collection Schedule</h4>
        </div>
      </div>

      <div className="row">
        {/* Schedule Creation Panel */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-success text-white py-3">
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
                  {activeClusters.map((cluster) => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.name} ({cluster.reportCount} reports)
                    </option>
                  ))}
                </select>
                {activeClusters.length === 0 && (
                  <div className="alert alert-info mt-2">
                    <small>✅ All clusters have been scheduled! New reports will create new clusters.</small>
                  </div>
                )}
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
                disabled={!selectedCluster || !selectedCollector || !scheduleDate || activeClusters.length === 0}
                className="btn btn-success w-100 btn-lg"
              >
                🚀 Create Smart Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Active Schedules */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white py-3">
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
              <div className="card text-white bg-primary border-0">
                <div className="card-body text-center">
                  <h5>Active Clusters</h5>
                  <h2>{activeClusters.length}</h2>
                  <small>Ready for scheduling</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-warning border-0">
                <div className="card-body text-center">
                  <h5>Scheduled</h5>
                  <h2>{schedules.filter(s => s.status === 'scheduled').length}</h2>
                  <small>Pending collection</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-success border-0">
                <div className="card-body text-center">
                  <h5>Completed</h5>
                  <h2>{schedules.filter(s => s.status === 'completed').length}</h2>
                  <small>Successfully collected</small>
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