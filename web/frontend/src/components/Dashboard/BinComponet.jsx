import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const BinComponent = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");

  const mockReports = [
    {
      _id: "1",
      reportId: "RPT-001",
      reportType: "illegal_dump",
      description: "Large illegal dumping near market",
      location: { coordinates: [-1.2921, 36.8219] },
      urgency: "high",
      status: "pending",
      submittedBy: "Anonymous",
      createdAt: new Date().toISOString()
    },
    {
      _id: "2",
      reportId: "RPT-002", 
      reportType: "full_bin",
      description: "Bin overflowing at bus stop",
      location: { coordinates: [-1.2833, 36.8167] },
      urgency: "critical", 
      status: "verified",
      submittedBy: "Anonymous",
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setReports(mockReports);
    

    fetch("https://smart-waste-nairobi-chi.vercel.app/api/bins")
      .then(response => response.json())
      .then(data => {
        console.log("Existing bins data:", data);
      })
      .catch(error => console.error("Error:", error));
  }, []);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      console.log(`Updating report ${reportId} to ${newStatus}`);
      
      setReports(reports.map(report => 
        report._id === reportId ? { ...report, status: newStatus } : report
      ));
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-warning",
      verified: "bg-info",
      completed: "bg-success"
    };
    return <span className={`badge ${statusConfig[status] || "bg-secondary"}`}>{status}</span>;
  };

  return (
    <div className="container">
      <h2>Citizen Reports</h2>
      
      <div className="mb-3">
        <label className="form-label">Filter:</label>
        <select 
          className="form-select" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{maxWidth: '200px'}}
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>{report.reportId}</td>
                <td className="text-capitalize">{report.reportType?.replace('_', ' ')}</td>
                <td>{report.description}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td>
                  {report.status === "pending" && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusUpdate(report._id, "verified")}
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BinComponent;