import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SidebarLayout from "../components/Sidebar";
import { CircularProgress } from "@mui/material";
import '../utils/css/styles.css';
import { decrypt } from '../utils/EncryptionUtils.js';
import Header from '../components/Header.js';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
          if (!accessLevel || accessLevel === "u") {
            navigate("/myInformation");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(`${process.env.REACT_APP_URL}/api/employee/getEmployees`, {
        headers: {
          Authorization: `Bearer ${decrypt(jwt)}`,
        },
      })
      .then((response) => {
        setEmployees(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  }, [navigate]);

  if (!sessionStorage.getItem("token")) {
    return null;
  }


  const columns = [
    { 
      field: "first_name", 
      headerName: "First Name",
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    { 
      field: "last_name", 
      headerName: "Last Name",
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    { 
      field: "email", 
      headerName: "Email", 
      flex: 1,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    {
      field: "is_active",
      headerName: "Is Active",
      flex: 0.5,
      renderCell: (params) => (params.value === 1 ? "true" : "false"),
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    {
      field: "update",
      headerName: "",
      renderCell: (params) => {
        const handleUpdate = () => {
          const employeeEmail = params.row.email;
          navigate(`/updateEmployee/${employeeEmail}`);
        };
        return (
          <button className="update-btn" onClick={handleUpdate}>
            Update
          </button>
        );
      },
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
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
         <Box display="flex" >
            <p className="text-titles-all">Employees</p>
        </Box>
        <DataGrid className="bg-white"
          rows={employees}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </div>
  );
};

export default Employees ;
