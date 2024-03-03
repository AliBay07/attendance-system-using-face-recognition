const {
    getFilteredLogs,
    getFilteredEmployeeLogs,
    getEmployeeLogInformation
  } = require("../controllers/LogController");
  
  const router = require("express").Router();
  
  router.get("/getFilteredLogs", getFilteredLogs);
  router.get("/getEmployeeLogs", getFilteredEmployeeLogs);
  router.get("/getEmployeeLogInformation", getEmployeeLogInformation)
  
  module.exports = router;
  