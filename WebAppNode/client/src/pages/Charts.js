import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.js";
import SidebarLayout from "../components/Sidebar";
import { CircularProgress } from "@mui/material";
import { Box, useTheme } from "@mui/material";
import { decrypt } from '../utils/EncryptionUtils.js';
import StatBox from "../components/StatBox.js";
import LogInformationFilter from "../components/LogInformationFilter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import TimerOffIcon from "@mui/icons-material/TimerOff";

const MyChart = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const [filters, setFilters] = useState({
    email: sessionStorage.getItem("email"),
    year: currentYear.toString(),
    month: currentMonth,
  });
  const [logInformation, setLogInformation] = useState({
    daysCameLate: 0,
    daysLeftEarly: 0,
    daysAbsent: 0,
    avgCameLateTime: 0,
    avgLeftEarlyTime: 0,
  });

  const handleSidebarToggle = (isSidebarOpen) => {
    setIsSidebarOpen(isSidebarOpen);
  };

  const handleFilterChange = (newFilters) => {
    newFilters.email = sessionStorage.getItem("email");
    setFilters(newFilters);
  };

  useEffect(() => {
    const jwt = sessionStorage.getItem("token");

    if (!jwt) {
      navigate("/login");
      return;
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
            return;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [navigate]);

  useEffect(() => {
    const getLogsInformation = () => {
      setIsLoading(true);
      axios
        .get(`${process.env.REACT_APP_URL}/api/log/getEmployeeLogInformation`, {
          headers: {
            Authorization: `Bearer ${decrypt(sessionStorage.getItem("token"))}`,
          },
          params: filters,
        })
        .then((response) => {
          setLogInformation(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    };

    getLogsInformation();
  }, [filters]);

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
            height="110vh"
            bgcolor="rgba(0, 0, 0, 0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="100"
          >
            <CircularProgress />
          </Box>
        )}
        <Box display="flex">
          <LogInformationFilter onFilterChange={handleFilterChange} />
        </Box>
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          marginTop={"20px"}
          ml={"20px"}
        >
          <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
            <StatBox
              title="Days Came Late"
              subtitle={logInformation.daysCameLate.toString()}
              icon={<AccessTimeIcon sx={{ color: "#000", fontSize: "40px" }} />}
            />
          </Box>

          <Box gridColumn={{ xs: "span 12", sm: "span 3" }}   ml={{ xs: "0", sm: "10px" }}
>
            <StatBox
              title="Days Left Early"
              subtitle={logInformation.daysLeftEarly.toString()}
              icon={<ScheduleIcon sx={{ color: "#000", fontSize: "40px" }} />}
            />
          </Box>

          <Box gridColumn={{ xs: "span 12", sm: "span 3" }}  ml={{ xs: "0", sm: "20px" }}
>
            <StatBox
              title="Days Absent"
              subtitle={logInformation.daysAbsent.toString()}
              icon={<EventBusyIcon sx={{ color: "#000", fontSize: "40px" }} />}
            />
          </Box>

          <Box
            gridColumn={{ xs: "span 12", sm: "span 6" }}
            ml={{ xs: "0", sm: "130px" }}
          >
            <StatBox
              title="Avg Came Late Time"
              subtitle={logInformation.avgCameLateTime.toString() + " mins"}
              icon={<TimelapseIcon sx={{ color: "#000", fontSize: "40px" }} />}
            />
          </Box>

          <Box
            gridColumn={{ xs: "span 12", sm: "span 6" }}
            ml={{ xs: "0", sm: "-110px" }}
          >
            <StatBox
              title="Avg Left Early Time"
              subtitle={logInformation.avgLeftEarlyTime.toString() + " mins"}
              icon={<TimerOffIcon sx={{ color: "#000", fontSize: "40px" }} />}
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default MyChart;
