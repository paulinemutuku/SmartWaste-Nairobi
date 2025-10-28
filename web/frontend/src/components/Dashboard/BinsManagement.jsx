import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const BinsManagement = () => {
  const [bins, setBins] = useState([]);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");

  const mockBins = [
    {
      id: "BIN-001",
      location: "Gikomba Market",
      coordinates: { lat: -1.2921, lng: 36.8219 },
      type: "market_bin",
      capacity: "240L",
      status: "needs_attention",
      lastCollected: "2024-01-15",
      ward: "Kamukunji",
      activeReports: 2
    },
    {
      id: "BIN-002",
      location: "Dandora Phase 1",
      coordinates: { lat: -1.2600, lng: 36.8700 },
      type: "public_bin", 
      capacity: "120L",
      status: "critical",
      lastCollected: "2024-01-10",
      ward: "Embakasi North",
      activeReports: 3
    },
    {
      id: "BIN-003",
      location: "Kilimani CBD",
      coordinates: { lat: -1.2833, lng: 36.8167 },
      type: "commercial_bin",
      capacity: "360L",
      status: "normal",
      lastCollected: "2024-01-14",
      ward: "Nairobi West",
      activeReports: 0
    },
    {
      id: "BIN-004",
      location: "Kawangware Market",
      coordinates: { lat: -1.2700, lng: 36.7500 },
      type: "market_bin",
      capacity: "240L",
      status: "needs_attention",
      lastCollected: "2024-01-12",
      ward: "Dagoretti North",
      activeReports: 1
    }
  ];

  useEffect(() => {
    setBins(mockBins);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      normal: { class: "bg-success", text: "Normal" },
      needs_attention: { class: "bg-warning", text: "Needs Attention" },
      critical: { class: "bg-danger", text: "Critical" },
      out_of_service: { class: "bg-secondary", text: "Out of Service" }
    };
    const config = statusConfig[status] || statusConfig.normal;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const handleAssignRoute = (binId) => {
    console.log(`Assign route for bin: ${binId}`);
    alert(`Route assignment feature for ${binId} - Coming soon!`);
  };

  const handleAddBin = () => {
    alert("Add new collection point feature - Coming soon!");
  };

  const filteredBins = bins.filter(bin => {
    if (filter === "all") return true;
    if (filter === "critical") return bin.status === "critical";
    if (filter === "attention") return bin.status === "needs_attention";
    if (filter === "normal") return bin.status === "normal";
    return true;
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Collection Points Management</h2>
          <p className="text-muted mb-0">Manage bin locations and monitor collection status across Nairobi</p>
        </div>
        <button className="btn btn-success" onClick={handleAddBin}>
          + Add New Point
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card text-white bg-primary h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Total Collection Points</h5>
                  <h2 className="card-text">{bins.length}</h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-trash fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card text-white bg-warning h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Needs Attention</h5>
                  <h2 className="card-text">{bins.filter(bin => bin.status === 'needs_attention').length}</h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-exclamation-triangle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card text-white bg-danger h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Critical Status</h5>
                  <h2 className="card-text">{bins.filter(bin => bin.status === 'critical').length}</h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-urgent fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card text-white bg-success h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Active Reports</h5>
                  <h2 className="card-text">{bins.reduce((sum, bin) => sum + bin.activeReports, 0)}</h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-flag fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bins Table */}
      <div className="card">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Collection Points</h5>
          <select 
            className="form-select form-select-sm" 
            style={{width: 'auto'}}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="critical">Critical Only</option>
            <option value="attention">Needs Attention</option>
            <option value="normal">Normal Only</option>
          </select>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Bin ID</th>
                  <th>Location</th>
                  <th>Ward</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Last Collected</th>
                  <th>Active Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBins.map((bin) => (
                  <tr key={bin.id}>
                    <td><strong>{bin.id}</strong></td>
                    <td>{bin.location}</td>
                    <td>{bin.ward}</td>
                    <td className="text-capitalize">{bin.type.replace('_', ' ')}</td>
                    <td>{bin.capacity}</td>
                    <td>{getStatusBadge(bin.status)}</td>
                    <td>{bin.lastCollected}</td>
                    <td>
                      {bin.activeReports > 0 ? (
                        <span className="badge bg-info">{bin.activeReports} reports</span>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAssignRoute(bin.id)}
                          title="Assign to collection route"
                        >
                          Assign Route
                        </button>
                        <button className="btn btn-outline-secondary" title="View details">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBins.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      <i className="fas fa-inbox fa-2x mb-2"></i>
                      <p>No collection points found for the selected filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ward Distribution */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Distribution by Ward</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {Array.from(new Set(bins.map(bin => bin.ward))).map(ward => (
                  <div key={ward} className="col-md-3 mb-2">
                    <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                      <span>{ward}</span>
                      <span className="badge bg-primary">
                        {bins.filter(bin => bin.ward === ward).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinsManagement;