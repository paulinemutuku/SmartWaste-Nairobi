import React, { useState, useEffect } from "react";

const ReportsAssessment = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      if (response.ok && result.success) {
        setReports(result.reports);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportPriority = async (reportId, priority) => {
    try {
      const response = await fetch(`https://smart-waste-nairobi-chi.vercel.app/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priority }) 
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setReports(reports.map(report => 
          report._id === reportId ? { ...report, priority } : report
        ));
        setSelectedReport(null);
        console.log(`✅ Priority updated to: ${priority}`);
        loadReports();
      } else {
        console.error("❌ Failed to update priority:", result.message);
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const getPriorityBadge = (priority, currentPriority) => {
    const isSelected = priority === currentPriority;
    const baseClass = "btn btn-sm ";
    
    switch(priority) {
      case 'low': 
        return baseClass + (isSelected ? "btn-success" : "btn-outline-success");
      case 'medium': 
        return baseClass + (isSelected ? "btn-warning" : "btn-outline-warning");
      case 'high': 
        return baseClass + (isSelected ? "btn-danger" : "btn-outline-danger");
      default: 
        return baseClass + "btn-outline-secondary";
    }
  };

  const getReviewStatus = (priority) => {
    return priority === 'pending' ? 'Needs Review' : 'Reviewed';
  };

  const getReviewBadgeColor = (priority) => {
    return priority === 'pending' ? 'bg-warning' : 'bg-success';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading reports...</span>
        </div>
        <p className="ms-3">Loading reports for assessment...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">📋 Reports Assessment</h4>
              <small>Review photos and set priority levels</small>
            </div>
            <div className="card-body">
              <div className="row">
                {reports.map((report) => (
                  <div key={report._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <strong>RPT-{report._id.slice(-4)}</strong>
                        <span className={`badge ${getReviewBadgeColor(report.priority)} float-end`}>
                          {getReviewStatus(report.priority)}
                        </span>
                      </div>
                      <div className="card-body">
                        <p className="card-text">{report.description}</p>
                        <p className="text-muted small">
                          📍 {report.location || 'Nairobi'}
                        </p>
                        <p className="text-muted small">
                          📅 {formatDate(report.createdAt)}
                        </p>
                        
                        {report.photos && report.photos.length > 0 ? (
  <div className="mb-3">
    <h6>Photos ({report.photos.length}):</h6>
    <div className="d-flex gap-2 flex-wrap">
      {report.photos.map((photo, index) => (
        <img 
          key={index}
          src={photo}
          alt={`Report photo ${index + 1}`}
          className="img-thumbnail"
          style={{ 
            width: '80px', 
            height: '80px', 
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          onError={(e) => {
            e.target.src = 'https://placehold.co/80x80/2d5a3c/ffffff/png?text=No+Photo';
          }}
          onClick={() => setSelectedReport({...report, selectedPhoto: photo})}
        />
      ))}
    </div>
  </div>
) : report.photo ? (
  <div className="mb-3">
    <h6>Photo:</h6>
    <img 
      src={report.photo}
      alt="Report photo"
      className="img-thumbnail"
      style={{ 
        width: '80px', 
        height: '80px', 
        objectFit: 'cover',
        cursor: 'pointer'
      }}
      onError={(e) => {
        e.target.src = 'https://placehold.co/80x80/2d5a3c/ffffff/png?text=No+Photo';
      }}
      onClick={() => setSelectedReport({...report, selectedPhoto: report.photo})}
    />
  </div>
) : (
  <p className="text-muted small">No photos available</p>
)}

                        <div className="btn-group w-100">
                          <button 
                            className={getPriorityBadge('low', report.priority)}
                            onClick={() => updateReportPriority(report._id, 'low')}
                          >
                            Low
                          </button>
                          <button 
                            className={getPriorityBadge('medium', report.priority)}
                            onClick={() => updateReportPriority(report._id, 'medium')}
                          >
                            Medium
                          </button>
                          <button 
                            className={getPriorityBadge('high', report.priority)}
                            onClick={() => updateReportPriority(report._id, 'high')}
                          >
                            High
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reports.length === 0 && (
                <div className="text-center text-muted py-5">
                  <h5>No reports to assess</h5>
                  <p>All reports have been reviewed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Report Details - RPT-{selectedReport._id.slice(-4)}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setSelectedReport(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Description:</strong> {selectedReport.description}</p>
                <p><strong>Location:</strong> {selectedReport.location || 'Nairobi'}</p>
                <p><strong>Current Priority:</strong> 
                  <span className={`badge ${getReviewBadgeColor(selectedReport.priority)} ms-2`}>
                    {selectedReport.priority}
                  </span>
                </p>
                <p><strong>Submitted:</strong> {formatDate(selectedReport.createdAt)}</p>
                {selectedReport.selectedPhoto && (
                  <div>
                    <h6>Photo Evidence:</h6>
                    <img 
                      src={selectedReport.selectedPhoto}
                      alt="Report evidence"
                      className="img-fluid rounded"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </button>
                <div className="btn-group">
                  <button 
                    className={getPriorityBadge('low', selectedReport.priority)}
                    onClick={() => updateReportPriority(selectedReport._id, 'low')}
                  >
                    Set Low Priority
                  </button>
                  <button 
                    className={getPriorityBadge('medium', selectedReport.priority)}
                    onClick={() => updateReportPriority(selectedReport._id, 'medium')}
                  >
                    Set Medium
                  </button>
                  <button 
                    className={getPriorityBadge('high', selectedReport.priority)}
                    onClick={() => updateReportPriority(selectedReport._id, 'high')}
                  >
                    Set High Priority
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAssessment;