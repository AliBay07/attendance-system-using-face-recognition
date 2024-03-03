const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { verifyAuth } = require("../utils/AuthUtil");
const { generatePassword } = require("../utils/PasswordUtil");
const { sendEmail } = require("../utils/EmailUtil")
const { encrypt } = require("../utils/EncryptionUtil");

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    if (result[0] === undefined) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    var secretKey = process.env.SECRET_KEY;
    if (user.role == "a") {
      secretKey = process.env.ADMIN_SECRET_KEY;
    }

    var token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
      expiresIn: "5h",
    });

    console.log("\n")
    console.log(token)

    token = encrypt(token);
    console.log("\n")
    console.log(token)
    
    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
};

module.exports.register = async (req, res) => {
  try {
    const { email, role } = req.body;

    const isAuthenticated = await verifyAuth(req, true);

    if (!isAuthenticated) {
      return res.status(403).json({ error: "Failed to register user" });
    }

    var password = generatePassword();
    console.log(password);
    const hashedPassword = await bcrypt.hash(password, 9);

    const result = await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [email, hashedPassword, role],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to register employee" });
    }

    sendEmail(email, password)

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (err) {
    console.error("Error register:", err);
    res.status(500).json({ error: "Failed to register" });
  }
};

module.exports.changePassword = async (req, res) => {
  const { old_password, new_password, email } = req.body;

  const isAuthenticated = await verifyAuth(req);

  if (!isAuthenticated) {
    return res.status(403).json({ error: "Failed to add employee" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    if (result[0] === undefined) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(old_password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 9);

    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedNewPassword, email],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

module.exports.verifyTokenAccess = (req, res) => {
  
  if (!req.headers.authorization) {
    return res.status(403).json({ value: null });
  }

  const token = req.headers.authorization.replace("Bearer ", "");

  const result = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ADMIN_SECRET_KEY, (err, decoded) => {
      if (err) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
          if (err) {
            resolve(null);
          } else {
            resolve("u");
          }
        });
      } else {
        resolve("a");
      }
    });
  });

  result.then((value) => {
    res.status(200).json({ value });
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });
};

