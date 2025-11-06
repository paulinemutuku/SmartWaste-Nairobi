import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackComponent = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);

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

  const getRatingStars = (rating, size = 'medium') => {
    const sizes = { small: '16px', medium: '20px', large: '28px' };
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= rating ? '#FFD700' : '#E5E7EB',
              fontSize: sizes[size],
              textShadow: star <= rating ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none',
              transition: 'all 0.3s ease',
              transform: star <= rating ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { bg: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', text: 'New' },
      reviewed: { bg: 'linear-gradient(135deg, #4ECDC4, #6EE7E7)', text: 'Reviewed' },
      addressed: { bg: 'linear-gradient(135deg, #2E8B57, #4CAF50)', text: 'Addressed' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span style={{
        background: config.bg,
        color: 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {config.text}
      </span>
    );
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

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      const response = await axios.put(`https://smart-waste-nairobi-chi.vercel.app/api/feedback/${feedbackId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setFeedback(prev => prev.map(item => 
          item._id === feedbackId ? { ...item, status: newStatus } : item
        ));
        setSelectedFeedback(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const styles = {
    container: { 
      padding: '30px', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    header: { 
      background: 'linear-gradient(135deg, #2E8B57 0%, #4CAF50 100%)',
      padding: '30px',
      borderRadius: '20px',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(46, 139, 87, 0.2)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    headerBg: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
    headerTitle: { 
      margin: 0, 
      fontSize: '32px', 
      fontWeight: '800',
      letterSpacing: '-0.5px',
      marginBottom: '8px'
    },
    headerSubtitle: {
      fontSize: '16px',
      opacity: 0.9,
      fontWeight: '400'
    },
    stats: { 
      display: 'flex', 
      gap: '15px', 
      marginTop: '20px',
      flexWrap: 'wrap'
    },
    stat: (type) => ({ 
      padding: '12px 20px', 
      borderRadius: '15px', 
      fontWeight: '700', 
      fontSize: '14px',
      background: type === 'total' ? 'rgba(255,255,255,0.2)' : type === 'new' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
      color: 'white',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }),
    loading: { 
      textAlign: 'center', 
      padding: '80px 20px', 
      fontSize: '18px', 
      color: '#6B7280',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    },
    noFeedback: { 
      textAlign: 'center', 
      padding: '80px 20px', 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)'
    },
    noFeedbackIcon: { 
      fontSize: '80px', 
      marginBottom: '20px',
      opacity: 0.7
    },
    noFeedbackTitle: { 
      color: '#374151', 
      marginBottom: '12px',
      fontSize: '24px',
      fontWeight: '700'
    },
    noFeedbackText: { 
      color: '#6B7280', 
      lineHeight: '1.6',
      fontSize: '16px',
      maxWidth: '400px',
      margin: '0 auto'
    },
    list: { 
      display: 'grid', 
      gap: '20px' 
    },
    card: { 
      background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
      borderRadius: '20px', 
      padding: '25px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    cardHover: { 
      transform: 'translateY(-5px)', 
      boxShadow: '0 15px 40px rgba(46, 139, 87, 0.15)',
      borderColor: 'rgba(46, 139, 87, 0.2)'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #2E8B57, #4CAF50)',
      borderRadius: '20px 20px 0 0'
    },
    headerRow: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      marginBottom: '20px' 
    },
    userInfo: {  },
    userName: { 
      display: 'block', 
      color: '#1F2937', 
      fontSize: '18px', 
      marginBottom: '6px',
      fontWeight: '700'
    },
    userEmail: { 
      color: '#6B7280', 
      fontSize: '14px',
      fontWeight: '500'
    },
    meta: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-end', 
      gap: '10px' 
    },
    date: { 
      color: '#9CA3AF', 
      fontSize: '13px',
      fontWeight: '500'
    },
    message: { 
      color: '#4B5563', 
      lineHeight: '1.6', 
      marginBottom: '20px',
      fontSize: '15px',
      fontWeight: '400'
    },
    actions: { 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    btnView: { 
      background: 'linear-gradient(135deg, #2E8B57 0%, #4CAF50 100%)',
      color: 'white', 
      border: 'none', 
      padding: '10px 20px', 
      borderRadius: '12px', 
      cursor: 'pointer', 
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(46, 139, 87, 0.3)'
    },
    btnViewHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(46, 139, 87, 0.4)'
    },
    modalOverlay: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.6)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 100,
      backdropFilter: 'blur(5px)'
    },
    modalContent: { 
      background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
      borderRadius: '24px', 
      width: '90%', 
      maxWidth: '600px', 
      maxHeight: '85vh', 
      overflow: 'hidden', 
      boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      border: '1px solid rgba(0,0,0,0.1)'
    },
    modalHeader: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '30px', 
      borderBottom: '1px solid #F3F4F6',
      background: 'linear-gradient(135deg, #2E8B57 0%, #4CAF50 100%)',
      color: 'white'
    },
    modalTitle: { 
      margin: 0, 
      fontSize: '24px',
      fontWeight: '700'
    },
    closeBtn: { 
      background: 'rgba(255,255,255,0.2)', 
      border: 'none', 
      fontSize: '24px', 
      cursor: 'pointer', 
      color: 'white', 
      padding: 0, 
      width: '40px', 
      height: '40px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)'
    },
    closeBtnHover: {
      background: 'rgba(255,255,255,0.3)',
      transform: 'scale(1.1)'
    },
    modalBody: { 
      padding: '30px', 
      maxHeight: '60vh', 
      overflowY: 'auto' 
    },
    detailSection: { 
      display: 'flex', 
      marginBottom: '25px', 
      alignItems: 'flex-start' 
    },
    detailLabel: { 
      fontWeight: '700', 
      color: '#374151', 
      width: '120px', 
      flexShrink: 0, 
      marginRight: '20px',
      fontSize: '15px'
    },
    detailValue: { 
      flex: 1 
    },
    ratingStarsLarge: { 
      marginRight: '15px',
      display: 'inline-block'
    },
    ratingText: { 
      color: '#6B7280', 
      fontSize: '16px',
      fontWeight: '600'
    },
    messageFull: { 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '20px', 
      borderRadius: '12px', 
      borderLeft: '4px solid #2E8B57', 
      lineHeight: '1.7', 
      color: '#4B5563',
      fontSize: '15px',
      fontWeight: '400'
    },
    modalActions: { 
      padding: '25px', 
      borderTop: '1px solid #F3F4F6', 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '15px'
    },
    statusActions: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },
    statusBtn: (active) => ({
      background: active ? 'linear-gradient(135deg, #2E8B57, #4CAF50)' : 'transparent',
      color: active ? 'white' : '#6B7280',
      border: active ? 'none' : '1px solid #D1D5DB',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }),
    btnClose: { 
      background: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
      color: 'white', 
      border: 'none', 
      padding: '12px 24px', 
      borderRadius: '12px', 
      cursor: 'pointer', 
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
    }
  };

  const [hoverStates, setHoverStates] = useState({});

    if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerBg}></div>
          <h2 style={styles.headerTitle}>User Feedback</h2>
          <p style={styles.headerSubtitle}>Listening to our community's voice</p>
        </div>
        <div style={styles.loading}>
          <div style={{fontSize: '48px', marginBottom: '20px'}}>💫</div>
          <h3 style={{color: '#374151', marginBottom: '10px'}}>Loading Feedback</h3>
          <p style={{color: '#6B7280'}}>Gathering insights from our users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Beautiful Header */}
      <div style={styles.header}>
        <div style={styles.headerBg}></div>
        <h2 style={styles.headerTitle}>User Feedback</h2>
        <p style={styles.headerSubtitle}>Listening to our community's voice</p>
        <div style={styles.stats}>
          <span style={styles.stat('total')}>Total: {feedback.length}</span>
          <span style={styles.stat('new')}>New: {feedback.filter(f => f.status === 'new').length}</span>
          <span style={styles.stat('reviewed')}>Reviewed: {feedback.filter(f => f.status === 'reviewed').length}</span>
          <span style={styles.stat('addressed')}>Addressed: {feedback.filter(f => f.status === 'addressed').length}</span>
        </div>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div style={styles.noFeedback}>
          <div style={styles.noFeedbackIcon}>💬</div>
          <h3 style={styles.noFeedbackTitle}>No Feedback Yet</h3>
          <p style={styles.noFeedbackText}>
            User feedback will appear here once submitted from the mobile app. 
            Your users' insights are valuable for improving SmartWaste!
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {feedback.map((item) => (
            <div 
              key={item._id} 
              style={{
                ...styles.card,
                ...(hoverStates[item._id] ? styles.cardHover : {})
              }}
              onMouseEnter={() => setHoverStates(prev => ({...prev, [item._id]: true}))}
              onMouseLeave={() => setHoverStates(prev => ({...prev, [item._id]: false}))}
              onClick={() => handleViewDetails(item)}
            >
              <div style={styles.cardGlow}></div>
              <div style={styles.headerRow}>
                <div style={styles.userInfo}>
                  <strong style={styles.userName}>
                    {item.submittedBy?.name || 'Anonymous User'}
                  </strong>
                  <span style={styles.userEmail}>
                    {item.submittedBy?.email || 'No email provided'}
                  </span>
                </div>
                <div style={styles.meta}>
                  {getStatusBadge(item.status)}
                  {getRatingStars(item.rating)}
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
                <div style={{color: '#6B7280', fontSize: '14px', fontWeight: '500'}}>
                  Click to view details
                </div>
                <button 
                  style={{
                    ...styles.btnView,
                    ...(hoverStates[item._id] ? styles.btnViewHover : {})
                  }}
                  onMouseEnter={() => setHoverStates(prev => ({...prev, [item._id]: true}))}
                  onMouseLeave={() => setHoverStates(prev => ({...prev, [item._id]: false}))}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(item);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Beautiful Modal */}
      {showModal && selectedFeedback && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Feedback Details</h3>
              <button 
                style={{
                  ...styles.closeBtn,
                  ...(hoveredStar === 'close' ? styles.closeBtnHover : {})
                }}
                onMouseEnter={() => setHoveredStar('close')}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>User:</div>
                <div style={styles.detailValue}>
                  <strong style={{fontSize: '18px', color: '#1F2937'}}>
                    {selectedFeedback.submittedBy?.name || 'Anonymous User'}
                  </strong>
                  <br />
                  <span style={{...styles.userEmail, fontSize: '15px'}}>
                    {selectedFeedback.submittedBy?.email || 'No email provided'}
                  </span>
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Rating:</div>
                <div style={styles.detailValue}>
                  <span style={styles.ratingStarsLarge}>
                    {getRatingStars(selectedFeedback.rating, 'large')}
                  </span>
                  <span style={styles.ratingText}>({selectedFeedback.rating}/5 stars)</span>
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Submitted:</div>
                <div style={styles.detailValue}>
                  <span style={{color: '#374151', fontWeight: '500'}}>
                    {formatDate(selectedFeedback.createdAt)}
                  </span>
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Status:</div>
                <div style={styles.detailValue}>
                  {getStatusBadge(selectedFeedback.status)}
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
              <div style={styles.statusActions}>
                <small style={{color: '#6B7280', fontWeight: '600', marginRight: '10px'}}>
                  Update Status:
                </small>
                <button 
                  style={styles.statusBtn(selectedFeedback.status === 'new')}
                  onClick={() => updateFeedbackStatus(selectedFeedback._id, 'new')}
                >
                  New
                </button>
                <button 
                  style={styles.statusBtn(selectedFeedback.status === 'reviewed')}
                  onClick={() => updateFeedbackStatus(selectedFeedback._id, 'reviewed')}
                >
                  Reviewed
                </button>
                <button 
                  style={styles.statusBtn(selectedFeedback.status === 'addressed')}
                  onClick={() => updateFeedbackStatus(selectedFeedback._id, 'addressed')}
                >
                  Addressed
                </button>
              </div>
              
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