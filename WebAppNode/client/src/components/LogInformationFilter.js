import React, { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";

const LogInformationFilter = ({ onFilterChange }) => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const handleFilterChange = () => {
    const filters = {
      year,
      month,
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
  return (
    <div>
      <p className="text-titles-all">Dashboard</p>
    <div className="flex-container">
 <TextField
        label="Year"
        id="outlined-search-em"
        type="search" 
        size="small"
        autoWidth
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

        <TextField
          id="outlined-select-em"
          select
          autoWidth
          label="Months"
          size="small"
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

      <Button variant="contained" size="medium" onClick={handleFilterChange}> Get logs information</Button>
    </div>
    </div>
  );
};

export default LogInformationFilter;
