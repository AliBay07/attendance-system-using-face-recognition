const db = require("../db");
const { verifyAuth } = require("../utils/AuthUtil");

module.exports.getFilteredLogs = async (req, res) => {
  try {

    const isAuthenticated = await verifyAuth(req, true)

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to fetch employees' });
    }

    const { name, email, year, month, status } = req.query;

    let sql = "SELECT * FROM logs WHERE 1=1";
    let params = [];

    if (name) {
      sql += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      sql += " AND email LIKE ?";
      params.push(`%${email}%`);
    }
    if (year) {
      sql += " AND year = ?";
      params.push(year);
    }
    if (month) {
      sql += " AND month = ?";
      params.push(month);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    const logs = await new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        resolve(JSON.parse(JSON.stringify(result)));
      });
    });
    
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error getting logs:", err);
    res.status(500).json({ error: "Failed to get logs" });
  }
};

module.exports.getFilteredEmployeeLogs = async (req, res) => {
  try {

    const isAuthenticated = await verifyAuth(req)

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to fetch employees' });
    }

    const { email, year, month, status } = req.query;

    let sql = "SELECT * FROM logs WHERE 1=1";
    let params = [];

    if (email) {
      sql += " AND email LIKE ?";
      params.push(`${email}%`);
    }
    if (year) {
      sql += " AND year = ?";
      params.push(year);
    }
    if (month) {
      sql += " AND month = ?";
      params.push(month);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    const logs = await new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        resolve(JSON.parse(JSON.stringify(result)));
      });
    });
    
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error getting logs:", err);
    res.status(500).json({ error: "Failed to get logs" });
  }
};
