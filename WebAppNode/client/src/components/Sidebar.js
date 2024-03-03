import React, { useState } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
} from "react-pro-sidebar";
import { useNavigate, Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Avatar from "react-avatar";
import "../utils/css/styles.css";
import {  FiUser, FiSettings } from "react-icons/fi";
import { ImDatabase } from "react-icons/im";

function SidebarLayout({ onSidebarToggle, isDefaultOpen }) {
  const { collapseSidebar } = useProSidebar();
  const [isCollapsed, setIsCollapsed] = useState(!isDefaultOpen);
  const [avatarSrc, setAvatarSrc] = useState(
    require("../utils/img/default.jpg")
  );
  const navigate = useNavigate();

  const handleSidebarCollapse = () => {
    setIsCollapsed(!isCollapsed);
    collapseSidebar();
    onSidebarToggle(!isCollapsed);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ position: "absolute", display: "flex", height: "100%" }}>
      <Sidebar
        style={{
          position: "relative",
          left: 0,
          top: 0,
          height: "100%",
          backgroundColor: "white",
          width: isCollapsed ? "10%" : "1px",
          transition: "width 0.3s ease-in-out",
        }}
      >
        {isCollapsed && (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <label htmlFor="avatarInput">
              <Avatar
                name={`${
                  sessionStorage.getItem("first_name")
                    ? sessionStorage
                        .getItem("first_name")
                        .charAt(0)
                        .toUpperCase() +
                      sessionStorage.getItem("first_name").slice(1)
                    : ""
                } ${
                  sessionStorage.getItem("last_name")
                    ? sessionStorage
                        .getItem("last_name")
                        .charAt(0)
                        .toUpperCase() +
                      sessionStorage.getItem("last_name").slice(1)
                    : ""
                }`}
                size="50"
                round
                src={avatarSrc}
                style={{ cursor: "pointer" }}
              />
              <div
                style={{
                  margin: "8px 0",
                  fontWeight: "bold",
                  color: "#012970",
                }}
              >
                {`${
                  sessionStorage.getItem("first_name")
                    ? sessionStorage
                        .getItem("first_name")
                        .charAt(0)
                        .toUpperCase() +
                      sessionStorage.getItem("first_name").slice(1)
                    : ""
                } ${
                  sessionStorage.getItem("last_name")
                    ? sessionStorage
                        .getItem("last_name")
                        .charAt(0)
                        .toUpperCase() +
                      sessionStorage.getItem("last_name").slice(1)
                    : ""
                }`}
              </div>
            </label>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
        )}
        {isCollapsed && (
          <div>
            <Menu>
              <SubMenu
                label={
                  <span className="sidebar-component-title">
                    TRACK AND ANALYSE
                  </span>
                }
                style={{ color: "#012970" }}
                icon={<FiUser />}
              >
                <MenuItem
                  component={<Link to="/myInformation" />}
                  className="sidebar-component-subtitle"
                >
                  My Information
                </MenuItem>
                <MenuItem
                  className="sidebar-component-subtitle"
                  component={<Link to="/myLogs" />}
                >
                  My Logs
                </MenuItem>
                <MenuItem
                  className="sidebar-component-subtitle"
                  component={<Link to="/charts" />}
                >
                  My Dashboard
                </MenuItem>
              </SubMenu>
            </Menu>

            {sessionStorage.getItem("role") == "a" && (
              <>
                <Menu>
                  <SubMenu
                    label={
                      <span className="sidebar-component-title">MANAGE</span>
                    }
                    style={{ color: "#012970" }}
                    icon={<ImDatabase />}
                  >
                    <MenuItem
                      component={<Link to="/addEmployee" />}
                      className="sidebar-component-subtitle"
                    >
                      Add Employee
                    </MenuItem>
                    <MenuItem
                      component={<Link to="/employees" />}
                      className="sidebar-component-subtitle"
                    >
                      Employees
                    </MenuItem>
                    <MenuItem
                      component={<Link to="/logs" />}
                      className="sidebar-component-subtitle"
                    >
                      Logs
                    </MenuItem>
                  </SubMenu>
                </Menu>
              </>
            )}
          </div>
        )}
        {isCollapsed && (
          <div>
            <Menu>
              <SubMenu
                label={
                  <span className="sidebar-component-title">SETTINGS</span>
                }
                style={{ color: "#012970" }}
                icon={<FiSettings />}
              >
                <MenuItem
                  component={<Link to="/changePassword" />}
                  className="sidebar-component-subtitle"
                >
                  Change Password
                </MenuItem>
                <MenuItem
                  className="sidebar-component-subtitle"
                  onClick={handleLogout}
                >
                  Log Out
                </MenuItem>
              </SubMenu>
            </Menu>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            zIndex: "999",
          }}
          onClick={handleSidebarCollapse}
        >
          <FaBars />
        </div>
      </Sidebar>
    </div>
  );
}

export default SidebarLayout;
