import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Reports.css"; // Optional: use this if you want custom styles

const BinComponent = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // ⛔ Temporarily replacing fetch with dummy data for visual testing
    const dummyReports = [
      {
        _id: "1",
        type: "bin",
        description: "Overflowing public bin near market",
        photo: "https://i.imgur.com/k5oB2Mv.jpg",
        latitude: -1.2931,
        longitude: 36.8219,
        status: "Pending",
        createdAt: "2025-07-02T10:15:00Z",
      },
      {
        _id: "2",
        type: "dump",
        description: "Illegal dumping behind school wall",
        photo: "https://i.imgur.com/3xVMEyS.jpg",
        latitude: -1.3012,
        longitude: 36.812,
        status: "Collected",
        createdAt: "2025-07-01T14:30:00Z",
      },
      {
        _id: "3",
        type: "dump",
        description: "Garbage burned next to footpath",
        photo: "",
        latitude: -1.297,
        longitude: 36.8261,
        status: "Pending",
        createdAt: "2025-07-03T09:00:00Z",
      },
    ];

    setReports(dummyReports);
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Citizen Waste Reports</h2>
      <div className="row">
        {reports.length === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                {report.photo ? (
                  <img
                    src={report.photo}
                    className="card-img-top"
                    alt="Waste Report"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex justify-content-center align-items-center"
                    style={{ height: "200px", color: "#888", fontSize: "0.9rem" }}
                  >
                    No photo uploaded
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title text-capitalize">
                    {report.type === "dump" ? "Illegal Dump Site" : "Public Bin"}
                  </h5>
                  <p className="card-text">{report.description}</p>
                  <p className="text-muted small">
                    📍 {report.latitude}, {report.longitude}
                    <br />
                    🕒 {new Date(report.createdAt).toLocaleString()}
                  </p>
                  <span
                    className={`badge ${
                      report.status === "Collected" ? "bg-success" : "bg-warning text-dark"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BinComponent;
