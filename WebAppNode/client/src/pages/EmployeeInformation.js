import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarLayout from "../components/Sidebar";
import { CircularProgress, Box } from "@mui/material";
import { decrypt } from '../utils/EncryptionUtils.js';
import '../utils/css/styles.css';
import Header from '../components/Header.js';

const EmployeeInformation = () => {
  const { employeeEmail } = useParams();
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleSidebarToggle = (isSidebarOpen) => {
    setIsSidebarOpen(isSidebarOpen);
  };

  useEffect(() => {
    const jwt = sessionStorage.getItem("token");

    if (!jwt) {
      navigate("/login");
    }

    axios
      .get(`${process.env.REACT_APP_URL}/api/auth/checkTokenAccess`, {
        headers: {
          Authorization: `Bearer ${decrypt(jwt)}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const accessLevel = response.data.value;
          if (!accessLevel) {
            navigate("/login");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const config = {
      headers: {
        Authorization: `Bearer ${decrypt(jwt)}`,
      },
    };

    axios
      .get(
        `${
          process.env.REACT_APP_URL
        }/api/employee/getEmployeeByEmail?email=${sessionStorage.getItem(
          "email"
        )}`,
        config
      )
      .then((response) => {
        setEmployeeData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  }, [employeeEmail]);

  if (isLoading) {
    return <Box
    position="absolute"
    top="0"
    left="0"
    right="0"
    bottom="0"
    height="110vh"
    bgcolor="rgba(0, 0, 0, 0.5)"
    display="flex"
    alignItems="center"
    justifyContent="center"
    zIndex="9999"
  >
    <CircularProgress />
  </Box>
  }

  const { email, first_name, last_name, is_active } = employeeData;

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
        <p className="text-titles-all">Employee Information</p>
        <p className="info-text ">Email</p>
        <div class="input-group input-group-icon">
        <input type="text" className="input-fields" placeholder={email}  readOnly/>
      </div>
      
      <p className="info-text ">First Name</p>
        <div class="input-group input-group-icon">
        <input type="text" className="input-fields" placeholder={first_name} readOnly/>
      </div>
        
      <p className="info-text ">Last Name</p>
        <div class="input-group input-group-icon">
        <input type="text" className="input-fields" placeholder={last_name} readOnly/>
      </div>
      <p className="info-text ">Active</p>
        <div class="input-group input-group-icon">
        <input type="text" className="input-fields" placeholder= {is_active ? "Yes" : "No"} readOnly/>
      </div>  
      </div>

    </div>
  );
};

export default EmployeeInformation;
