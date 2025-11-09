import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Bin from "./pages/Bin";
import Collectors from "./pages/Collectors";
import UsersPage from "./pages/UsersPage";
import Map from "./pages/Map";
import Schedule from "./pages/Schedule";
import ReportClustersPage from "./pages/ReportClustersPage";
import "./App.css";
import ReportsAssessment from "./pages/ReportsAssessment";
import FeedbackComponent from './components/Dashboard/FeedbackComponent';
import OptimizedRoutes from "./pages/OptimizedRoutes";

const App = () => {
  const { user } = useAuthContext();

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/bins" element={<Bin />} />
          <Route path="/report-clusters" element={<ReportClustersPage />} />
          <Route path="/collectors" element={<Collectors />} />
          <Route path="/public-users" element={<UsersPage />} />
          <Route path="/mapview" element={<Map />} />
          <Route path="/feedback" element={<FeedbackComponent />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports-assessment" element={<ReportsAssessment />} />
          <Route path="/optimized-routes" element={<OptimizedRoutes />} />
          <Route
            path="/"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route
  path="/login"
  element={!user ? <Login /> : <Navigate to="/dashboard" />}
/>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;

//   return (
//     <div>
//       <BrowserRouter>
//         <Routes>
//           <Route
//             path="/bins"
//             element={user ? <Bin /> : <Navigate to="/login" replace />}
//             exact
//           />
//           <Route
//             path="/collectors"
//             element={user ? <Collectors /> : <Navigate to="/login" replace />}
//             exact
//           />
//           <Route
//             path="/public-users"
//             element={user ? <Users /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/mapview"
//             element={user ? <Map /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/feedback"
//             element={user ? <Feedback /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/schedule"
//             element={user ? <Schedule /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/dashboard"
//             element={user ? <Dashboard /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/login"
//             element={!user ? <Login /> : <Navigate to="/dashboard" />}
//           />
//           <Route
//             path="/register"
//             element={!user ? <Register /> : <Navigate to="/dashboard" />}
//           />
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// };

// export default App;

