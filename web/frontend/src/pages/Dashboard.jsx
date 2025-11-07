import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import Home from "../components/Dashboard/Home";

function Dashboard() {
  return (
    <div className="grid-container">
      <Sidebar />
      <Home />
    </div>
  );
}

export default Dashboard;
