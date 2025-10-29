import React from "react";
import "../components/Dashboard/Dashboard.css";
import Header from "../components/Dashboard/Header";
import Sidebar from "../components/Dashboard/Sidebar";
import Users from "./Users";

function UsersPage() {
  return (
    <div className="grid-container">
      <Header />
      <Sidebar />
      <Users />
    </div>
  );
}

export default UsersPage;