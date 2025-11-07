import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import MapView from "../components/Dashboard/MapView";

function Map() {
  return (
    <div className="grid-container">
      <Sidebar />
      <MapView />
    </div>
  );
}

export default Map;
