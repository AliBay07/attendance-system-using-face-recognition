const {
  getAllEmployees,
  getEmployeeByEmail,
  updateEmployee,
  addEmployee,
  getEmployeeRole,
  getFaceEmbedding
  } = require("../controllers/EmployeeController");
  
  const router = require("express").Router();
  
  router.get("/getEmployees", getAllEmployees);
  router.get("/getEmployeeByEmail", getEmployeeByEmail)
  router.get("/getEmployeeRole", getEmployeeRole)
  router.put("/updateEmployee", updateEmployee)
  router.post("/addEmployee", addEmployee)
  router.post("/getFaceEmbedding", getFaceEmbedding)
  
  module.exports = router;
  