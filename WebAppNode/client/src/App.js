import React from "react";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Logs from "./pages/Logs";
import AddEmployee from "./pages/AddEmployee";
import ChangePassword from "./pages/ChangePassword"
import UpdateEmployee from "./pages/UpdateEmployee";
import EmployeeInformation from "./pages/EmployeeInformation";
import EmployeeLogs from "./pages/EmployeeLogs";
import Charts from "./pages/Charts";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/employees" element={<Employees />} />
        <Route exact path="/logs" element={<Logs />} />
        <Route exact path="/charts" element={<Charts />} />
        <Route exact path="/myInformation" element={<EmployeeInformation />} />
        <Route exact path="/myLogs" element={<EmployeeLogs />} />
        <Route exact path="/addEmployee" element={<AddEmployee />} />
        <Route exact path="/changePassword" element={<ChangePassword />} />
        <Route exact path="/updateEmployee/:employeeEmail" element={<UpdateEmployee />} />
        <Route path="*" element={<Navigate to="/myInformation" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
