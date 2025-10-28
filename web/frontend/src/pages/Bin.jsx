import React from "react";
import "../components/Dashboard/Dashboard.css";
import Header from "../components/Dashboard/Header";
import Sidebar from "../components/Dashboard/Sidebar";
import BinsManagement from "../components/Dashboard/BinsManagement";

function Bin() {
  return (
    <div className="grid-container">
      <Header />
      <Sidebar />
      <BinsManagement />
    </div>
  );
}

export default Bin;