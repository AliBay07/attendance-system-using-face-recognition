import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
} from "@material-ui/core";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { decrypt } from '../utils/EncryptionUtils.js';
import "../utils/css/styles.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please fill in your email.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
      return;
    }

    if (!password) {
      toast.error("Please fill in your password.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      var token = response.data.token;
      console.log(token)
      if (token == null) {
        return;
      }
      const employee = await axios.get(
        `${process.env.REACT_APP_URL}/api/employee/getEmployeeByEmail`,
        {
          headers: {
            Authorization: `Bearer ${decrypt(token)}`,
          },
          params: {
            email: email,
          },
        }
      );

      if (employee.data.is_active == 0) {
        toast.error("Invalid email or password", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        return;
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("first_name", employee.data.first_name);
        sessionStorage.setItem("last_name", employee.data.last_name);
        sessionStorage.setItem("email", employee.data.email);

        const employeeRole = await axios.get(
          `${process.env.REACT_APP_URL}/api/employee/getEmployeeRole`,
          {
            headers: {
              Authorization: `Bearer ${decrypt(token)}`,
            },
            params: {
              email: email,
            },
          }
        );
        sessionStorage.setItem("role", employeeRole.data);
        
        navigate("/myInformation");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="bg-light-blue">
      <div className="row">
        <div className="col-md-4 offset-md-1 welcome-text">
          <p className="welcome-text-style-blue">Attendance </p>
          <p className="welcome-text-style-black">for your business</p>
          <p>
          As an administrator or user, you have reached the secure login page for our advanced facial recognition system. This cutting-edge technology allows for seamless and accurate attendance tracking, ensuring a hassle-free experience for everyone involved.
          Whether you're an admin or a user, please enter your credentials below to access the system and manage attendance records effortlessly. If you have any questions or encounter any issues, our dedicated support team is here to assist you.
          </p>
        </div>
        <div className="col-md-4 offset-md-2">
          <div className="login-form-container">
            <p className="text-titles-all">Login</p>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <p className="text-login">Email</p>
                  <TextField
                    variant="outlined"
                    className="outlined-search-login"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <p className="text-login">Password </p>
                  <TextField
                    variant="outlined"
                    className="outlined-search-login"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="submit-btn-login"
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
