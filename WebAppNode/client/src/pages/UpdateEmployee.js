import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../components/Sidebar";
import { CircularProgress, Box } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "../utils/css/styles.css";
import { decrypt } from '../utils/EncryptionUtils.js';
import Header from "../components/Header.js";

const UpdateEmployee = () => {
  const { employeeEmail } = useParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [faceEmbedding, setFaceEmbedding] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imageData, setImageData] = useState(null);
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
          if (!accessLevel || accessLevel === "u") {
            navigate("/myInformation");
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

    setIsLoading(true);

    axios
      .get(
        `${process.env.REACT_APP_URL}/api/employee/getEmployeeByEmail?email=${employeeEmail}`,
        config
      )
      .then((response) => {
        console.log("Employee Data:", response.data);
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
        setIsActive(response.data.is_active);
        setFaceEmbedding(response.data.face_embedding);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    axios
      .get(`${process.env.REACT_APP_URL}/api/employee/getEmployeeRole`, {
        headers: {
          Authorization: `Bearer ${decrypt(jwt)}`,
        },
        params: {
          email: employeeEmail,
        },
      })
      .then((resultRole) => {
        const role = resultRole.data;
        if (role == "a") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      });

    setIsLoading(false);
  }, [employeeEmail]);

  const getFaceEmbedding = async (base64Image) => {
    const jwt = sessionStorage.getItem("token");

    const instance = axios.create({
      maxBodyLength: 100 * 1024 * 1024,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decrypt(jwt)}`,
      },
    });

    try {
      const response = await instance.post(
        `${process.env.REACT_APP_URL}/api/employee/getFaceEmbedding`,
        {
          image_base64: base64Image,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting face embedding:", error);
      return "No faces detected";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImageData(null);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!firstName || !lastName || !employeeEmail) {
      toast.error("All fields are required.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
      return;
    }

    var updatedEmployee = {
      email: employeeEmail,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      is_admin: isAdmin,
      face_embedding: faceEmbedding,
    };

    if (imageData) {
      const base64Image = imageData.split(",")[1];

      setIsLoading(true);
      const faceEmbeddingResult = await getFaceEmbedding(base64Image);
      setIsLoading(false);

      if (faceEmbeddingResult === "No faces detected") {
        toast.error("No faces were detected in the image.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
      } else {
        updatedEmployee.face_embedding = faceEmbeddingResult;
      }
    }

    const token = sessionStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${decrypt(token)}`,
      },
    };

    setIsLoading(true);

    axios
      .put(
        `${process.env.REACT_APP_URL}/api/employee/updateEmployee`,
        updatedEmployee,
        config
      )
      .then((response) => {
        console.log("Employee updated successfully:", response.data);
        toast.success("User updated successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
        setIsLoading(false);
      });
  };

  return (
    <div className="bg-blue">
      <Header />
      <SidebarLayout onSidebarToggle={handleSidebarToggle} />
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
          zIndex="9999"
        >
          <CircularProgress />
        </Box>
      )}
      <div
        style={{
          marginLeft: isSidebarOpen ? "320px" : "150px",
          transition: "margin-left 0.3s ease",
          marginTop: "18px",
        }}
      >
        <form onSubmit={handleFormSubmit}>
          <div class="row">
            <p className="text-titles-all">Update Employee</p>

            <p className="info-text ">First Name</p>
            <div class="input-group input-group-icon">
              <input
                className="input-fields"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <p className="info-text ">Last Name</p>
            <div class="input-group input-group-icon">
              <input
                className="input-fields"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <p className="info-text ">Email</p>
            <div class="input-group input-group-icon">
              <input
                type="text"
                value={employeeEmail}
                disabled
                className="input-fields"
              />
            </div>
          </div>

          <p className="info-text ">Employee Image</p>
          <div class="row">
            <div>
              <input
                className="input-fields"
                type="file"
                onChange={handleImageChange}
              />
            </div>

            <div class="checkbox-container">
              <label for="my-checkbox" className="info-text ">
                Is Active?
              </label>
              <input
                id="my-checkbox"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          </div>
          <div class="checkbox-container">
            <label for="my-checkbox" className="info-text ">
              Is Admin?
            </label>
            <input
              id="my-checkbox"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          </div>
          <button className="submit-btn" type="submit">
            Update
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UpdateEmployee;
