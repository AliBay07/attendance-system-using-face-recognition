import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SidebarLayout from "../components/Sidebar";
import { CircularProgress } from "@mui/material";
import EmployeeLogFilters from "../components/EmployeeLogFilters";
import { decrypt } from '../utils/EncryptionUtils.js';
import Header from '../components/Header.js';

const EmployeeLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const [filters, setFilters] = useState({
    email: sessionStorage.getItem("email"),
    year: currentYear.toString(),
    month: currentMonth,
    status: "",
  });

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
            navigate("/myInformation");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [navigate]);

  useEffect(() => {
    const getLogs = () => {
      setIsLoading(true);
      axios
        .get(`${process.env.REACT_APP_URL}/api/log/getEmployeeLogs`, {
          headers: {
            Authorization: `Bearer ${decrypt(sessionStorage.getItem("token"))}`,
          },
          params: filters,
        })
        .then((response) => {
          setLogs(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    };

    getLogs();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    newFilters.email = sessionStorage.getItem("email");
    setFilters(newFilters);
  };

  if (!sessionStorage.getItem("token")) {
    return null;
  }

  const columns = [
    { field: "status", headerName: "Status", flex: 0.5, headerClassName: "custom-header" },
    { field: "time", headerName: "Time", flex: 1 , headerClassName: "custom-header"},
    { field: "year", headerName: "Year", flex: 0.5 , headerClassName: "custom-header"},
    { field: "month", headerName: "Month", flex: 0.5 , headerClassName: "custom-header"},
  ];

  return (
    <div className="bg-blue">
            <Header />
      <SidebarLayout onSidebarToggle={handleSidebarToggle} />
      <Box
        m="20px"
        height="75vh"
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
        <Box display="flex"   mb={2}>
          <EmployeeLogFilters onFilterChange={handleFilterChange} />
        </Box>
        <DataGrid className="bg-white"
          rows={logs}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </div>
  );
};

export default EmployeeLogs;
