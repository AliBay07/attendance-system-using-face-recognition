import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import '../utils/css/styles.css';

const StatBox = ({ title, subtitle, icon }) => {
  const theme = useTheme();
  return (

    <Box display="flex" className='white-box'>
    <Box>
      <Typography
        fontFamily={"Times New Roman"}
        variant="h6"
        className="text-box"
        fontWeight="bold"
        sx={{ color: "#000" }}
      >
        {title}
      </Typography>
      <Box display="flex" alignItems="center" marginTop="10px">
        <Box marginRight="10px">
          {icon}
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#03137e" }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </Box>


  );
};

export default StatBox;
