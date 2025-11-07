import React from "react";
import {
  BsFillPersonCheckFill,
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsPeopleFill,
  BsMenuButtonWideFill,
  BsCalendar3,
  BsBoxArrowRight
} from "react-icons/bs";
import { RiMapPinFill } from "react-icons/ri";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";

const Sidebar = ({ openSidebarToggle, OpenSidebar }) => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <BsFillPersonCheckFill className="icon_header" /> Admin
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>
          X
        </span>
      </div>

      {/* Admin Info Section */}
      {user && user.user && (
        <div className="admin-info">
          <div className="admin-name">Welcome, {user.user.name}</div>
          <div className="admin-email">{user.user.email}</div>
        </div>
      )}

      <ul className="sidebar-list">
        <a href="/dashboard">
          <li className="sidebar-list-item">
            <BsGrid1X2Fill className="icon" /> Dashboard
          </li>
        </a>
        <a href="/report-clusters">
          <li className="sidebar-list-item">
            <BsFillArchiveFill className="icon" /> Report Clusters
          </li>
        </a>
        <a href="/collectors">
          <li className="sidebar-list-item">
            <BsPeopleFill className="icon" /> Collectors
          </li>
        </a>
        <a href="/public-users">
          <li className="sidebar-list-item">
            <BsPeopleFill className="icon" /> Public-users
          </li>
        </a>
        <a href="/mapview">
          <li className="sidebar-list-item">
            <RiMapPinFill className="icon" /> Map View
          </li>
        </a>
        <a href="/feedback">
          <li className="sidebar-list-item">
            <BsMenuButtonWideFill className="icon" /> Feedback
          </li>
        </a>
        <a href="/schedule">
          <li className="sidebar-list-item">
            <BsCalendar3 className="icon" /> Schedule
          </li>
        </a>
        
        {/* Logout Button */}
        <li className="sidebar-list-item logout-item" onClick={logout}>
          <BsBoxArrowRight className="icon" /> Logout
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;