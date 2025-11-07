import React from "react";
import "../components/Dashboard/Dashboard.css";
import Sidebar from "../components/Dashboard/Sidebar";
import Users from "./Users";

function UsersPage() {
  return (
    <div className="grid-container">
      <Sidebar />
      <Users />
    </div>
  );
}

export default UsersPage;