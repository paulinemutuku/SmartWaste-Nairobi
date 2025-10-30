import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackComponent = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('https://smart-waste-nairobi-chi.vercel.app/api/feedback/all');
      if (response.data.success) {
        setFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'status-new', text: 'New' },
      reviewed: { class: 'status-reviewed', text: 'Reviewed' },
      addressed: { class: 'status-addressed', text: 'Addressed' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowModal(true);
  };

  const styles = {
    container: { padding: '20px', background: '#f8f9fa', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #e9ecef' },
    headerTitle: { color: '#2E8B57', margin: 0, fontSize: '28px' },
    stats: { display: 'flex', gap: '15px' },
    stat: (type) => ({ 
      padding: '8px 16px', 
      borderRadius: '20px', 
      fontWeight: '600', 
      fontSize: '14px',
      background: type === 'total' ? '#e3f2fd' : type === 'new' ? '#fff3e0' : '#e8f5e8',
      color: type === 'total' ? '#1976d2' : type === 'new' ? '#f57c00' : '#2E8B57'
    }),
    loading: { textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' },
    noFeedback: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    noFeedbackIcon: { fontSize: '64px', marginBottom: '20px' },
    noFeedbackTitle: { color: '#666', marginBottom: '10px' },
    noFeedbackText: { color: '#999', lineHeight: '1.6' },
    list: { display: 'grid', gap: '20px' },
    card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderLeft: '4px solid #2E8B57', transition: 'transform 0.2s, box-shadow 0.2s' },
    cardHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
    userInfo: {  },
    userName: { display: 'block', color: '#333', fontSize: '16px', marginBottom: '4px' },
    userEmail: { color: '#666', fontSize: '14px' },
    meta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
    statusBadge: (status) => ({
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      background: status === 'new' ? '#ffebee' : status === 'reviewed' ? '#fff3e0' : '#e8f5e8',
      color: status === 'new' ? '#c62828' : status === 'reviewed' ? '#ef6c00' : '#2E8B57'
    }),
    ratingStars: { color: '#FFD700', fontSize: '16px' },
    date: { color: '#999', fontSize: '12px' },
    message: { color: '#555', lineHeight: '1.5', marginBottom: '15px' },
    actions: { display: 'flex', justifyContent: 'flex-end' },
    btnView: { background: '#2E8B57', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e9ecef', background: '#f8f9fa' },
    modalTitle: { margin: 0, color: '#2E8B57' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666', padding: 0, width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBody: { padding: '20px', maxHeight: '60vh', overflowY: 'auto' },
    detailSection: { display: 'flex', marginBottom: '20px', alignItems: 'flex-start' },
    detailLabel: { fontWeight: '600', color: '#333', width: '100px', flexShrink: 0, marginRight: '15px' },
    detailValue: { flex: 1 },
    ratingStarsLarge: { color: '#FFD700', fontSize: '24px', marginRight: '10px' },
    ratingText: { color: '#666', fontSize: '14px' },
    messageFull: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #2E8B57', lineHeight: '1.6', color: '#555' },
    modalActions: { padding: '20px', borderTop: '1px solid #e9ecef', textAlign: 'right' },
    btnClose: { background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>User Feedback</h2>
        </div>
        <div style={styles.loading}>Loading feedback...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>User Feedback</h2>
        <div style={styles.stats}>
          <span style={styles.stat('total')}>Total: {feedback.length}</span>
          <span style={styles.stat('new')}>New: {feedback.filter(f => f.status === 'new').length}</span>
          <span style={styles.stat('reviewed')}>Reviewed: {feedback.filter(f => f.status === 'reviewed').length}</span>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div style={styles.noFeedback}>
          <div style={styles.noFeedbackIcon}>💬</div>
          <h3 style={styles.noFeedbackTitle}>No Feedback Yet</h3>
          <p style={styles.noFeedbackText}>User feedback will appear here once submitted from the mobile app.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {feedback.map((item) => (
            <div key={item._id} style={styles.card}>
              <div style={styles.headerRow}>
                <div style={styles.userInfo}>
                  <strong style={styles.userName}>
                    {item.submittedBy?.name || 'Anonymous User'}
                  </strong>
                  <span style={styles.userEmail}>
                    {item.submittedBy?.email || 'No email'}
                  </span>
                </div>
                <div style={styles.meta}>
                  <span style={styles.statusBadge(item.status)}>{item.status}</span>
                  <span style={styles.ratingStars} title={`${item.rating}/5 stars`}>
                    {getRatingStars(item.rating)}
                  </span>
                  <span style={styles.date}>{formatDate(item.createdAt)}</span>
                </div>
              </div>
              
              <div style={styles.message}>
                {item.message.length > 150 ? 
                  `${item.message.substring(0, 150)}...` : 
                  item.message
                }
              </div>
              
              <div style={styles.actions}>
                <button 
                  style={styles.btnView}
                  onClick={() => handleViewDetails(item)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedFeedback && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Feedback Details</h3>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>User:</div>
                <div style={styles.detailValue}>
                  <strong>{selectedFeedback.submittedBy?.name || 'Anonymous User'}</strong>
                  <br />
                  <span style={styles.userEmail}>{selectedFeedback.submittedBy?.email || 'No email'}</span>
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Rating:</div>
                <div style={styles.detailValue}>
                  <span style={styles.ratingStarsLarge}>
                    {getRatingStars(selectedFeedback.rating)}
                  </span>
                  <span style={styles.ratingText}>({selectedFeedback.rating}/5)</span>
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Submitted:</div>
                <div style={styles.detailValue}>
                  {formatDate(selectedFeedback.createdAt)}
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Status:</div>
                <div style={styles.detailValue}>
                  <span style={styles.statusBadge(selectedFeedback.status)}>
                    {selectedFeedback.status}
                  </span>
                </div>
              </div>

              <div style={{...styles.detailSection, flexDirection: 'column'}}>
                <div style={styles.detailLabel}>Message:</div>
                <div style={styles.messageFull}>
                  {selectedFeedback.message}
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={styles.btnClose}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;