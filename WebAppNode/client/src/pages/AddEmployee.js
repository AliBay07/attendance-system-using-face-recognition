import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { CircularProgress, Box } from "@mui/material";
import { decrypt } from '../utils/EncryptionUtils.js';
import "react-toastify/dist/ReactToastify.min.css";
import "../utils/css/styles.css";
import Header from "../components/Header.js";

const AddEmployee = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  }, [navigate]);

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!firstName || !lastName || !email || !image) {
        toast.error("All fields are required.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        return;
      }

      setLoading(true);

      const token = sessionStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${decrypt(token)}`,
        },
      };

      const existingEmployee = await axios.get(
        `${process.env.REACT_APP_URL}/api/employee/getEmployeeByEmail/?email=${email}`,
        config
      );

      if (existingEmployee.data.id) {
        setLoading(false);
        toast.error("Email already exists.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result.split(",")[1];

        const faceEmbedding = await getFaceEmbedding(base64Image);

        if (faceEmbedding === "No faces detected") {
          setLoading(false);
          toast.error("No faces were detected in the image.", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
          });
          return;
        }

        const newEmployee = {
          email: email,
          first_name: firstName,
          last_name: lastName,
          is_active: isActive,
          is_admin: isAdmin,
          image: base64Image,
          face_embedding: faceEmbedding,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_URL}/api/employee/addEmployee`,
          newEmployee,
          config
        );

        console.log("Employee added successfully:", response.data);

        setLoading(false);

        toast.success("User added successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
      };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error("Error adding employee:", error);
      setLoading(false);
    }
  };

  const handleSidebarToggle = (isSidebarOpen) => {
    setIsSidebarOpen(isSidebarOpen);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
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
        {loading && (
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

        <form onSubmit={handleFormSubmit}>
          <div class="row">
            <p className="text-titles-all">Add Employee</p>

            <div class="input-group input-group-icon">
              <input
                type="text"
                placeholder="First Name"
                className="input-fields"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div class="input-group input-group-icon">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-fields"
              />
            </div>

            <div class="input-group input-group-icon">
              <input
                type="text"
                placeholder="Email"
                className="input-fields"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div class="row">
            <div>
              <input
                type="file"
                className="input-fields"
                onChange={handleImageChange}
              />
            </div>

            <div class="checkbox-container">
              <label for="my-checkbox">Is Active?</label>
              <input
                id="my-checkbox"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          </div>
          <div class="checkbox-container">
            <label for="my-checkbox">Is Admin?</label>
            <input
              id="my-checkbox"
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
            />
          </div>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default AddEmployee;
