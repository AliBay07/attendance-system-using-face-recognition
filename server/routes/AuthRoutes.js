const {
    login,
    register,
    verifyTokenAccess,
    changePassword
  } = require("../controllers/AuthController");
  
  const router = require("express").Router();
  
  router.post("/login", login);
  router.post("/register", register);
  router.post("/changePassword", changePassword)
  router.get("/checkTokenAccess", verifyTokenAccess)
  
  module.exports = router;
  