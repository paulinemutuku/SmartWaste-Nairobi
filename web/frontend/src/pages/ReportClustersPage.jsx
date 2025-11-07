import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import ReportClusters from "../components/Dashboard/ReportClusters";

function ReportClustersPage() {
  return (
    <div className="grid-container">
      <Sidebar />
      <ReportClusters />
    </div>
  );
}

export default ReportClustersPage;