import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -1.2921,
  lng: 36.8219,
};

const MapView = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDfO-cbObfcLzAwzjpI9qZG-w_aDHmJ5Dk",
    libraries,
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);

  const mockReports = [
    {
      id: "1",
      reportId: "RPT-001",
      type: "illegal_dump",
      description: "Large illegal dumping near Gikomba Market",
      location: { lat: -1.2921, lng: 36.8219 },
      urgency: "high",
      status: "pending",
      submittedBy: "Anonymous",
      photos: []
    },
    {
      id: "2",
      reportId: "RPT-002", 
      type: "full_bin",
      description: "Bin overflowing at Bus Station",
      location: { lat: -1.2833, lng: 36.8167 },
      urgency: "critical",
      status: "verified",
      submittedBy: "Anonymous",
      photos: []
    },
    {
      id: "3",
      reportId: "RPT-003",
      type: "illegal_dump", 
      description: "Dumping in river near Dandora",
      location: { lat: -1.2600, lng: 36.8700 },
      urgency: "high",
      status: "pending",
      submittedBy: "Anonymous",
      photos: []
    }
  ];

  const clusterReports = (reports, thresholdMeters = 100) => {
    const clustered = [];
    const used = new Set();
    
    reports.forEach((report, index) => {
      if (used.has(index)) return;
      
      const cluster = [report];
      used.add(index);
      
      reports.forEach((otherReport, otherIndex) => {
        if (!used.has(otherIndex) && index !== otherIndex) {
          const distance = calculateDistance(
            report.location.lat, report.location.lng,
            otherReport.location.lat, otherReport.location.lng
          );
          
          if (distance <= thresholdMeters) {
            cluster.push(otherReport);
            used.add(otherIndex);
          }
        }
      });
      
      if (cluster.length > 0) {
        clustered.push({
          id: `cluster-${index}`,
          reports: cluster,
          center: calculateClusterCenter(cluster),
          count: cluster.length
        });
      }
    });
    
    return clustered;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateClusterCenter = (cluster) => {
    const sum = cluster.reduce((acc, report) => ({
      lat: acc.lat + report.location.lat,
      lng: acc.lng + report.location.lng
    }), { lat: 0, lng: 0 });
    
    return {
      lat: sum.lat / cluster.length,
      lng: sum.lng / cluster.length
    };
  };

  useEffect(() => {
    setReports(mockReports);
    
    const clustered = clusterReports(mockReports);
    setClusters(clustered);
  }, []);

  const getMarkerIcon = (urgency, isCluster = false, clusterSize = 1) => {
    if (isCluster) {
      return {
        url: `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`,
        scaledSize: new window.google.maps.Size(40, 40),
      };
    }
    
    const color = urgency === 'critical' ? 'red' : 
                  urgency === 'high' ? 'orange' : 
                  urgency === 'medium' ? 'yellow' : 'green';
    
    return {
      url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    };
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
      >
        {/* Display clustered markers */}
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.center}
            icon={getMarkerIcon('medium', true, cluster.reports.length)}
            onClick={() => setSelectedReport({
              ...cluster.reports[0],
              isCluster: true,
              clusterSize: cluster.reports.length,
              clusterReports: cluster.reports
            })}
          />
        ))}
        
        {/* Fallback:*/}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={report.location}
            icon={getMarkerIcon(report.urgency)}
            onClick={() => setSelectedReport(report)}
          />
        ))}

        {/* Info Window */}
        {selectedReport && (
          <InfoWindow
            position={selectedReport.location}
            onCloseClick={() => setSelectedReport(null)}
          >
            <div style={{ padding: '10px', maxWidth: '250px' }}>
              {selectedReport.isCluster ? (
                <>
                  <h5 style={{ color: '#1976d2', marginBottom: '8px' }}>
                    📍 Report Cluster
                  </h5>
                  <p><strong>Reports in area:</strong> {selectedReport.clusterSize}</p>
                  <p><strong>Location:</strong> Nairobi</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => console.log("View cluster details", selectedReport)}
                  >
                    View All Reports
                  </button>
                </>
              ) : (
                <>
                  <h5 style={{ 
                    color: selectedReport.urgency === 'critical' ? '#d32f2f' : 
                           selectedReport.urgency === 'high' ? '#f57c00' : '#388e3c',
                    marginBottom: '8px'
                  }}>
                    {selectedReport.urgency === 'critical' ? '🚨 ' : '📝 '}
                    {selectedReport.reportId}
                  </h5>
                  <p><strong>Type:</strong> {selectedReport.type.replace('_', ' ')}</p>
                  <p><strong>Status:</strong> 
                    <span className={`badge ${
                      selectedReport.status === 'pending' ? 'bg-warning' : 
                      selectedReport.status === 'verified' ? 'bg-success' : 'bg-secondary'
                    }`} style={{ marginLeft: '8px' }}>
                      {selectedReport.status}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-success">Verify</button>
                    <button className="btn btn-info">View Details</button>
                  </div>
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}>
        <h6 style={{ marginBottom: '8px' }}>Map Legend</h6>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', marginRight: '8px' }}></div>
          <span>Critical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'orange', borderRadius: '50%', marginRight: '8px' }}></div>
          <span>High Urgency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'blue', borderRadius: '50%', marginRight: '8px' }}></div>
          <span>Report Clusters</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;