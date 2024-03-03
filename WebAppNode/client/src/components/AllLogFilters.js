import React, { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import '../utils/css/styles.css';

const AllLogFilters = ({ onFilterChange }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  const handleFilterChange = () => {
    const filters = {
      name,
      email,
      year,
      month,
      status,
    };
    onFilterChange(filters);
  };

  const months = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  const employeestatus = [    
    { name: "In", value: "In" },
    { name: "Out", value: "Out" }, 
];

  return (
 
    <div>
     <p className="text-titles-all"> Employee Logs</p>

    <div className="flex-container">
      <TextField
        label="Name" 
        size="small"
        id="outlined-search"
        type="search" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoWidth
      />
      <TextField
        label="Email"
        id="outlined-search"
        type="search" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoWidth
        size="small"
      />
      <TextField
        label="Year"
        size="small"
        id="outlined-search"
        type="search" 
        autoWidth
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
        <TextField
          id="outlined-select"
          select
          autoWidth
          size="small"
          label="Status"
          defaultValue="All"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {employeestatus.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.value}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="outlined-select"
          select
          size="small"
          autoWidth
          label="Months"
          defaultValue="All"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
        {months.map((month) => (
          <MenuItem key={month.value} value={month.value}>
            {month.name}
          </MenuItem>
        ))}
        </TextField>
      <Button variant="contained" size="medium" onClick={handleFilterChange}> Get logs </Button>
    </div>
    </div>
  );
};

export default AllLogFilters;
