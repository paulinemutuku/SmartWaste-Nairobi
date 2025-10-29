import React from "react";
import "../components/Dashboard/Dashboard.css";
import Header from "../components/Dashboard/Header";
import Sidebar from "../components/Dashboard/Sidebar";
import ReportsAssessment from "../components/Dashboard/ReportsAssessment";

function ReportsAssessmentPage() {
  return (
    <div className="grid-container">
      <Header />
      <Sidebar />
      <ReportsAssessment />
    </div>
  );
}

export default ReportsAssessmentPage;