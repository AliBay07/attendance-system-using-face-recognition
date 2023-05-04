const {
    getFilteredLogs,
    getFilteredEmployeeLogs
  } = require("../controllers/LogController");
  
  const router = require("express").Router();
  
  router.get("/getFilteredLogs", getFilteredLogs);
  router.get("/getEmployeeLogs", getFilteredEmployeeLogs);
  
  module.exports = router;
  