import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import ReportsAssessment from "../components/Dashboard/ReportsAssessment";

function ReportsAssessmentPage() {
  return (
    <div className="grid-container">
      <Sidebar />
      <ReportsAssessment />
    </div>
  );
}

export default ReportsAssessmentPage;