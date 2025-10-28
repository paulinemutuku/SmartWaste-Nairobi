import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./schedule.css";

function ScheduleComponent() {
  const [nairobiWards, setNairobiWards] = useState(["Kamukunji", "Embakasi North", "Dagoretti North", "Nairobi West"]);
  const [selectedWard, setSelectedWard] = useState("Kamukunji");
  const [workingHours, setWorkingHours] = useState({ start: 8, end: 17 });
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);

  useEffect(() => {
    fetchCollectors();
    fetchSchedule();
    fetchPendingReports(); 
  }, []);

  const fetchCollectors = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/collector-details");
      if (response.ok) {
        const CollectorData = await response.json();
        setCollectors(CollectorData.collectors);
      } else {
        console.error("Failed to fetch collectors:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching collectors:", error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get("http://localhost:1337/api/scheduleCollection");
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const mockReports = [
        { id: "RPT-001", ward: "Kamukunji", urgency: "high", type: "illegal_dump" },
        { id: "RPT-002", ward: "Kamukunji", urgency: "critical", type: "full_bin" },
        { id: "RPT-003", ward: "Embakasi North", urgency: "medium", type: "overflow" }
      ];
      setPendingReports(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      const wardReports = pendingReports.filter(report => report.ward === selectedWard);
      
      if (wardReports.length > 0) {
        const response = await axios.post("http://localhost:1337/api/scheduleCollection", {
          ward: selectedWard,
          workingHours,
          collectorID: selectedCollector,
          reportCount: wardReports.length,
          urgencyLevel: wardReports.some(r => r.urgency === "critical") ? "high" : "normal"
        });
        setResponseMessage(`✅ Schedule created for ${selectedWard} - ${wardReports.length} reports to collect`);
        fetchSchedule();
      } else {
        setResponseMessage("ℹ️ No pending reports in this ward. Schedule not needed.");
      }
    } catch (error) {
      console.error("Error scheduling collection:", error);
      setResponseMessage("❌ Error creating schedule. Please try again.");
    }
  };

  const getWardReportCount = (ward) => {
    return pendingReports.filter(report => report.ward === ward).length;
  };

  const getWardUrgency = (ward) => {
    const wardReports = pendingReports.filter(report => report.ward === ward);
    if (wardReports.some(r => r.urgency === "critical")) return "high";
    if (wardReports.some(r => r.urgency === "high")) return "medium";
    return "low";
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">🗓️ Smart Collection Schedule</h4>
        </div>
        <div className="card-body">
          {/* Nairobi Wards Selection */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Nairobi Ward:</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="form-select"
              >
                <option value="" disabled>-- Select Ward --</option>
                {nairobiWards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward} ({getWardReportCount(ward)} reports)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label fw-bold">Working Hours:</label>
              <div className="input-group">
                <input
                  type="number"
                  max={23}
                  min={0}
                  value={workingHours.start}
                  onChange={(e) => setWorkingHours({...workingHours, start: parseInt(e.target.value)})}
                  className="form-control text-center"
                  placeholder="Start"
                />
                <span className="input-group-text">to</span>
                <input
                  type="number"
                  max={23}
                  min={0}
                  value={workingHours.end}
                  onChange={(e) => setWorkingHours({...workingHours, end: parseInt(e.target.value)})}
                  className="form-control text-center"
                  placeholder="End"
                />
              </div>
            </div>
          </div>

          {/* Collector Selection */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Assign Collector:</label>
              <select
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
                className="form-select"
              >
                <option value="" disabled>-- Select Collector --</option>
                {collectors.map((collector) => (
                  <option key={collector._id} value={collector._id}>
                    {collector.name} - {collector.vehicle || "No vehicle"}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <div className="card bg-light h-100">
                <div className="card-body text-center">
                  <h6 className="card-title">Ward Summary</h6>
                  <div className="row">
                    <div className="col-6">
                      <span className="badge bg-info fs-6">{getWardReportCount(selectedWard)}</span>
                      <small className="d-block">Pending Reports</small>
                    </div>
                    <div className="col-6">
                      <span className={`badge ${
                        getWardUrgency(selectedWard) === 'high' ? 'bg-danger' : 
                        getWardUrgency(selectedWard) === 'medium' ? 'bg-warning' : 'bg-success'
                      } fs-6`}>
                        {getWardUrgency(selectedWard)}
                      </span>
                      <small className="d-block">Priority</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Schedule Button */}
          <div className="row">
            <div className="col-12">
              <button 
                onClick={handleGenerateSchedule} 
                className="btn btn-success btn-lg w-100"
                disabled={!selectedCollector || getWardReportCount(selectedWard) === 0}
              >
                🚀 Generate Smart Schedule
              </button>
              {responseMessage && (
                <div className={`alert ${
                  responseMessage.includes('✅') ? 'alert-success' : 
                  responseMessage.includes('ℹ️') ? 'alert-info' : 'alert-danger'
                } mt-3`}>
                  {responseMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Schedules Table */}
      {schedule && schedule.length > 0 && (
        <div className="card mt-4 shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">📋 Active Collection Schedules</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Collector</th>
                    <th>Ward</th>
                    <th>Report Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((entry) => (
                    <tr key={entry._id}>
                      <td>{new Date(entry.date).toLocaleDateString('en-KE')}</td>
                      <td>
                        {collectors.find(c => c._id === entry.collectorID)?.name || entry.collectorID}
                      </td>
                      <td>{entry.ward || "N/A"}</td>
                      <td>
                        <span className="badge bg-primary">{entry.reportCount || 0}</span>
                      </td>
                      <td>
                        <span className="badge bg-success">Scheduled</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Schedules Message */}
      {(!schedule || schedule.length === 0) && (
        <div className="card mt-4">
          <div className="card-body text-center text-muted">
            <h5>📭 No Active Schedules</h5>
            <p>Generate your first smart schedule based on citizen reports!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleComponent;