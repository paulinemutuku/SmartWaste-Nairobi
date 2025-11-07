import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import BinsManagement from "../components/Dashboard/BinsManagement";

function Bin() {
  return (
    <div className="grid-container">
      <Sidebar />
      <BinsManagement />
    </div>
  );
}

export default Bin;