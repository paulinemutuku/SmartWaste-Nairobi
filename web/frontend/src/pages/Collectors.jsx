import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import Collector from "../components/Dashboard/Collectors";

function Collectors() {
  return (
    <div className="grid-container">
      <Sidebar />
      <Collector />
    </div>
  );
}

export default Collectors;
