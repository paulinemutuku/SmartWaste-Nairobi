import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import Feedbacks from "../components/Dashboard/FeedbackComponent";

function Feedback() {
  return (
    <div className="grid-container">
      <Sidebar />
      <Feedbacks />
    </div>
  );
}

export default Feedback;
