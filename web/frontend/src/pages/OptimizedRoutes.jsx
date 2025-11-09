import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../components/Dashboard/Sidebar";

// Fix for leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OptimizedRoutes = () => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  useEffect(() => {
    loadOptimizedRoutes();
  }, []);

  const loadOptimizedRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/optimization/optimized-routes");
      
      if (!response.ok) {
        throw new Error('Failed to fetch optimized routes');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setOptimizedRoutes(result.optimizedRoutes);
        if (result.optimizedRoutes.length > 0) {
          setSelectedRoute(result.optimizedRoutes[0]);
        }
      }
    } catch (error) {
      console.error('Error loading optimized routes:', error);
      // Fallback to empty routes - won't break the page
      setOptimizedRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const getRouteColor = (priority) => {
    switch (priority) {
      case 'Critical Priority Zone': return '#8B0000';
      case 'High Priority Zone': return '#FF0000';
      case 'Medium Priority Area': return '#FFA500';
      case 'Low Priority Zone': return '#008000';
      default: return '#2d5a3c';
    }
  };

  const getRouteCoordinates = (route) => {
    if (!route || !route.clusters) return [];
    return route.clusters.map(cluster => [cluster.center[0], cluster.center[1]]);
  };

  if (loading) {
    return (
      <div className="grid-container">
        <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
        <main className="main-container">
          <div className="d-flex justify-content-center align-items-center" style={{height: "50vh"}}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Calculating optimal routes...</span>
            </div>
            <p className="ms-3">Calculating optimal collection routes...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid-container">
      <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
      
      <main className="main-container">
        <div className="main-title">
          <h3>🚛 OPTIMIZED COLLECTION ROUTES</h3>
        </div>

        <div className="row">
          {/* Routes List */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">🗺️ Collection Routes</h5>
                <small>{optimizedRoutes.length} optimized routes generated</small>
              </div>
              <div className="card-body" style={{maxHeight: "400px", overflowY: "auto"}}>
                {optimizedRoutes.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <p>No optimized routes available</p>
                    <small>Reports will appear here when available</small>
                  </div>
                ) : (
                  optimizedRoutes.map((route, index) => (
                    <div 
                      key={route.id}
                      className={`card mb-2 cursor-pointer ${selectedRoute?.id === route.id ? 'border-success' : ''}`}
                      onClick={() => setSelectedRoute(route)}
                      style={{cursor: 'pointer', borderLeft: `4px solid ${getRouteColor(route.priority)}`}}
                    >
                      <div className="card-body py-2">
                        <h6 className="card-title mb-1">{route.name}</h6>
                        <div className="d-flex justify-content-between text-muted small">
                          <span>📍 {route.totalStops} stops</span>
                          <span>⏱️ {route.estimatedTime}min</span>
                        </div>
                        <div className="d-flex justify-content-between text-muted small">
                          <span>📏 {route.distance}km</span>
                          <span className="badge" style={{backgroundColor: getRouteColor(route.priority)}}>
                            {route.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {selectedRoute ? `📍 ${selectedRoute.name}` : '🗺️ Route Map'}
                </h5>
                <button 
                  className="btn btn-light btn-sm"
                  onClick={loadOptimizedRoutes}
                >
                  🔄 Refresh Routes
                </button>
              </div>
              <div className="card-body p-0" style={{height: "500px"}}>
                <MapContainer
                  center={selectedRoute ? selectedRoute.clusters[0]?.center : [-1.286389, 36.817223]}
                  zoom={12}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* Render selected route */}
                  {selectedRoute && getRouteCoordinates(selectedRoute).map((coord, index) => (
                    <Marker key={index} position={coord}>
                      <Popup>
                        <div>
                          <strong>Stop {index + 1}</strong><br/>
                          <small>Lat: {coord[0].toFixed(6)}</small><br/>
                          <small>Lng: {coord[1].toFixed(6)}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Render route line */}
                  {selectedRoute && getRouteCoordinates(selectedRoute).length > 1 && (
                    <Polyline
                      positions={getRouteCoordinates(selectedRoute)}
                      color={getRouteColor(selectedRoute.priority)}
                      weight={4}
                      opacity={0.7}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Route Statistics */}
        {optimizedRoutes.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">📊 Route Optimization Summary</h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <div className="border rounded p-3">
                        <h4 className="text-success">{optimizedRoutes.length}</h4>
                        <small className="text-muted">Total Routes</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="border rounded p-3">
                        <h4 className="text-primary">
                          {optimizedRoutes.reduce((sum, route) => sum + route.totalStops, 0)}
                        </h4>
                        <small className="text-muted">Total Stops</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="border rounded p-3">
                        <h4 className="text-warning">
                          {optimizedRoutes.reduce((sum, route) => sum + parseFloat(route.distance), 0).toFixed(1)}km
                        </h4>
                        <small className="text-muted">Total Distance</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="border rounded p-3">
                        <h4 className="text-info">
                          {optimizedRoutes.reduce((sum, route) => sum + route.estimatedTime, 0)}min
                        </h4>
                        <small className="text-muted">Total Time</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OptimizedRoutes;