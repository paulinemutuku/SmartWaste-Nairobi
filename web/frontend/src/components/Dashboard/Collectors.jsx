import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faUserPlus,
  faMapMarkerAlt,
  faStar,
  faClock,
  faCheckCircle,
  faUserCheck,
  faUserSlash
} from "@fortawesome/free-solid-svg-icons";

function Collectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollector, setNewCollector] = useState({
    name: "",
    email: "",
    phone: "",
    zone: ""
  });

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/collectors");
      const result = await response.json();
      
      if (response.ok && result.success) {
        setCollectors(result.collectors);
      }
    } catch (error) {
      console.error("Error loading collectors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollector = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/collectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCollector),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setCollectors([...collectors, result.collector]);
        setNewCollector({ name: "", email: "", phone: "", zone: "" });
        setShowAddForm(false);
        alert("Collector added successfully!");
      }
    } catch (error) {
      console.error("Error adding collector:", error);
      alert("Error adding collector");
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/collectors/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeAccount: !currentStatus }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setCollectors(collectors.map(collector => 
          collector._id === id ? result.collector : collector
        ));
      }
    } catch (error) {
      console.error("Error updating collector status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this collector?")) {
      try {
        const response = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/collectors/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
          setCollectors(collectors.filter(collector => collector._id !== id));
          alert("Collector deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting collector:", error);
      }
    }
  };

  const getPerformanceBadge = (performance) => {
    const rating = performance.rating || 5;
    if (rating >= 4.5) return "bg-success";
    if (rating >= 3.5) return "bg-warning";
    return "bg-danger";
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading collection teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={style.header}>Nairobi Collection Teams</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Add New Collector
        </button>
      </div>

      {/* Add Collector Form */}
      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Add New Collection Team Member</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddCollector}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCollector.name}
                    onChange={(e) => setNewCollector({...newCollector, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newCollector.email}
                    onChange={(e) => setNewCollector({...newCollector, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={newCollector.phone}
                    onChange={(e) => setNewCollector({...newCollector, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Zone/Area</label>
                  <select
                    className="form-control"
                    value={newCollector.zone}
                    onChange={(e) => setNewCollector({...newCollector, zone: e.target.value})}
                    required
                  >
                    <option value="">Select Zone</option>
                    <option value="Central Nairobi">Central Nairobi</option>
                    <option value="Westlands">Westlands</option>
                    <option value="Embakasi">Embakasi</option>
                    <option value="Kasarani">Kasarani</option>
                    <option value="Dagoretti">Dagoretti</option>
                    <option value="Kamukunji">Kamukunji</option>
                    <option value="Starehe">Starehe</option>
                    <option value="Makadara">Makadara</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Add Collector
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collectors Table */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faUserCheck} className="me-2" />
            Collection Team Members ({collectors.length})
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Collector Name</th>
                  <th>Contact Info</th>
                  <th>Zone</th>
                  <th>Performance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collectors.map((collector) => (
                  <tr key={collector._id}>
                    <td>
                      <strong>{collector.name}</strong>
                    </td>
                    <td>
                      <div>{collector.email}</div>
                      <small className="text-muted">{collector.phone}</small>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                      {collector.zone}
                    </td>
                    <td>
  {collector.performance.reportsCompleted > 0 ? (
    <>
      <span className={`badge ${getPerformanceBadge(collector.performance)}`}>
        <FontAwesomeIcon icon={faStar} className="me-1" />
        {collector.performance.rating}/5
      </span>
      <br />
      <small className="text-muted">
        {collector.performance.reportsCompleted} reports completed
      </small>
    </>
  ) : (
    <span className="badge bg-secondary">
      <FontAwesomeIcon icon={faStar} className="me-1" />
      No ratings yet
    </span>
  )}
</td>
                    <td>
                      <span className={`badge ${collector.activeAccount ? 'bg-success' : 'bg-secondary'}`}>
                        <FontAwesomeIcon 
                          icon={collector.activeAccount ? faUserCheck : faUserSlash} 
                          className="me-1" 
                        />
                        {collector.activeAccount ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => handleUpdateStatus(collector._id, collector.activeAccount)}
                      >
                        {collector.activeAccount ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(collector._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {collectors.length === 0 && (
            <div className="text-center text-muted py-4">
              <FontAwesomeIcon icon={faUserPlus} size="3x" className="mb-3" />
              <p>No collection team members yet. Add your first collector!</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card bg-light">
            <div className="card-body text-center">
              <div className="row">
                <div className="col-md-3">
                  <h6 className="text-muted">Total Collectors</h6>
                  <h4 className="text-primary">{collectors.length}</h4>
                </div>
                <div className="col-md-3">
                  <h6 className="text-muted">Active Teams</h6>
                  <h4 className="text-success">
                    {collectors.filter(c => c.activeAccount).length}
                  </h4>
                </div>
                <div className="col-md-3">
                  <h6 className="text-muted">Avg Rating</h6>
                  <h4 className="text-warning">
  {collectors.filter(c => c.performance.reportsCompleted > 0).length > 0 
    ? (collectors
        .filter(c => c.performance.reportsCompleted > 0)
        .reduce((sum, c) => sum + (c.performance.rating || 0), 0) / 
       collectors.filter(c => c.performance.reportsCompleted > 0).length
      ).toFixed(1)
    : '0.0'}/5
</h4>
                </div>
                <div className="col-md-3">
                  <h6 className="text-muted">Total Reports Handled</h6>
                  <h4 className="text-info">
                    {collectors.reduce((sum, c) => sum + (c.performance.reportsCompleted || 0), 0)}
                  </h4>
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
    color: "darkgreen",
    fontSize: "24px",
    fontWeight: "bold"
  }
};

export default Collectors;