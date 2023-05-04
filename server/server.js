const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require('body-parser');
const employeeRoutes = require("./routes/EmployeesRoutes");
const authRoutes = require("./routes/AuthRoutes");
const logRoutes = require("./routes/LogRoutes");

const app = express();

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

app.use("/api/employee", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/log", logRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
