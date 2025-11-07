import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import Schedules from "../components/Dashboard/ScheduleComponent";

function Schedule() {
  return (
    <div className="grid-container">
      <Sidebar />
      <Schedules />
    </div>
  );
}

export default Schedule;
