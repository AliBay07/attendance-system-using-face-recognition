const db = require("../db");
const moment = require('moment-timezone');
const { verifyAuth } = require("../utils/AuthUtil");

module.exports.getFilteredLogs = async (req, res) => {
  try {
    const isAuthenticated = await verifyAuth(req, true);

    if (!isAuthenticated) {
      return res.status(403).json({ error: "Failed to fetch employees" });
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

    logs.forEach((log) => {
      const userTime = moment(log.time)
        .tz("Asia/Beirut")
        .format("YYYY-MM-DD HH:mm:ss");

      log.time = userTime;
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

    logs.forEach((log) => {
      const serverTime = moment(log.time);
      const lebaneseTime = serverTime.tz("Asia/Beirut").format("YYYY-MM-DD HH:mm:ss");
      log.time = lebaneseTime;
    });

    res.status(200).json(logs);
  } catch (err) {
    console.error("Error getting logs:", err);
    res.status(500).json({ error: "Failed to get logs" });
  }
};

module.exports.getEmployeeLogInformation = async (req, res) => {
  try {
    const isAuthenticated = await verifyAuth(req);

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to fetch employees' });
    }

    const { email, year, month } = req.query;

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

    const logs = await new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        resolve(JSON.parse(JSON.stringify(result)));
      });
    });

    var daysCameLate = 0;
    var daysLeftEarly = 0;
    var daysAbsent = 0;
    var totalLateMinutes = 0;
    var totalLeftEarlyMinutes = 0;
    var totalLateCount = 0;
    var totalLeftEarlyCount = 0;
    var prevLogDate = null;

    logs.sort((a, b) => {
      const aLebaneseTime = moment(a.time).tz('Asia/Beirut');
      const bLebaneseTime = moment(b.time).tz('Asia/Beirut');
    
      if (aLebaneseTime.isBefore(bLebaneseTime)) {
        return -1; 
      } else if (aLebaneseTime.isAfter(bLebaneseTime)) {
        return 1; 
      } else {
        return 0; 
      }
    });

    logs.forEach((log) => {
      const serverTime = moment(log.time);
      const lebaneseTime = serverTime.tz("Asia/Beirut").format("YYYY-MM-DD HH:mm:ss");
      log.time = lebaneseTime;

      if (prevLogDate) {
        const daysDiff = serverTime.diff(prevLogDate, 'days');
        if (daysDiff > 1) {
          for (let i = 1; i < daysDiff; i++) {
            const dateToCheck = prevLogDate.clone().add(i, 'days');
            if (dateToCheck.day() !== 0 && dateToCheck.day() !== 6) {
              daysAbsent++;
            }
          }
        }
      }

      if (log.status === 'in' && serverTime.isAfter(serverTime.clone().startOf('day').add({ hours: 9, minutes: 15 }))) {
        daysCameLate++;
        const lateMinutes = serverTime.diff(serverTime.clone().startOf('day').add({ hours: 9 }), 'minutes');
        totalLateMinutes += lateMinutes;
        totalLateCount++;
      }

      if (log.status === 'out' && serverTime.isBefore(serverTime.clone().startOf('day').add({ hours: 17, minute: 45 }))) {
        daysLeftEarly++;
        const leftEarlyMinutes = serverTime.clone().startOf('day').add({ hours: 18 }).diff(serverTime, 'minutes');
        totalLeftEarlyMinutes += leftEarlyMinutes;
        totalLeftEarlyCount++;
      }

      prevLogDate = serverTime.clone().startOf('day');
    });

    var avgCameLateTime = 0;
    if (totalLateCount > 0) {
      avgCameLateTime = Math.floor(totalLateMinutes / totalLateCount);
    }

    var avgLeftEarlyTime = 0;
    if (totalLeftEarlyCount > 0) {
      avgLeftEarlyTime = Math.floor(totalLeftEarlyMinutes / totalLeftEarlyCount);
    }
    
    res.status(200).json({
      daysCameLate,
      daysLeftEarly,
      daysAbsent,
      avgCameLateTime,
      avgLeftEarlyTime,
    });
  } catch (err) {
    console.error("Error getting logs:", err);
    res.status(500).json({ error: "Failed to get logs" });
  }
};

