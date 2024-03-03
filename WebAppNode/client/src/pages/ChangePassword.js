import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import SidebarLayout from "../components/Sidebar";
import { CircularProgress, Box } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { decrypt } from '../utils/EncryptionUtils.js';
import axios from "axios";
import "../utils/css/styles.css";
import Header from "../components/Header.js";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSidebarToggle = (isSidebarOpen) => {
    setIsSidebarOpen(isSidebarOpen);
  };

  useEffect(() => {
    const jwt = sessionStorage.getItem("token");

    if (!jwt) {
      navigate("/login");
    }

    setIsLoading(false);

  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm new password do not match.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
      setIsLoading(false);
      return;
    }

    const jwt = sessionStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${decrypt(jwt)}`,
      },
    };

    try {
      const email = sessionStorage.getItem("email");
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/changePassword`,
        {
          old_password: oldPassword,
          new_password: newPassword,
          email: email,
        },
        config
      );

      if (response.status === 200) {
        toast.success("Password changed successfully.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });

        setIsLoading(false);
      } else {
        toast.error(response.data.error, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error(err.response.data.error, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue">
      <Header />
      <SidebarLayout onSidebarToggle={handleSidebarToggle} />
      <div
        style={{
          marginLeft: isSidebarOpen ? "320px" : "150px",
          transition: "margin-left 0.3s ease",
          marginTop: "40px",
        }}
      >
        {isLoading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgcolor="rgba(0, 0, 0, 0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="100"
          >
            <CircularProgress />
          </Box>
        )}
        <p className="text-titles-all">Change Password</p>
        <form onSubmit={handleSubmit}>
          <div class="row">
            <div class="input-group input-group-icon">
              <input
                placeholder="Old Password"
                type="password"
                className="input-fields"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div class="input-group input-group-icon">
              <input
                placeholder="New Password"
                type="password"
                className="input-fields"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div class="input-group input-group-icon">
              <input
                placeholder="Confirm New Password"
                type="password"
                className="input-fields"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="submit-btn" type="submit">
            Submit
          </button>
        </form>
        <ToastContainer /> 
      </div>
    </div>
  );
};

export default ChangePassword;
