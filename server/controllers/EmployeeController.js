const db = require("../db");
const axios = require('axios');
require("dotenv").config();
const { verifyAuth } = require("../utils/AuthUtil");

module.exports.getAllEmployees = async (req, res) => {
  try {

    const isAuthenticated = await verifyAuth(req, true)

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to fetch employees' });
    }

    const result = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id, first_name, last_name, email, is_active FROM employees',
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

module.exports.getEmployeeRole = async (req, res) => {
  try {

    const isAuthenticated = await verifyAuth(req)

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to fetch employees role' });
    }

    const { email } = req.query;

    const result = await new Promise((resolve, reject) => {
      db.query(
        'SELECT role FROM users WHERE email = ?',
        [email],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result[0].role);
          }
        }
      );
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching employee's role", err);
    res.status(500).json({ error: "Failed to fetch employee's role" });
  }
};

module.exports.getEmployeeByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    const isAuthenticated = await verifyAuth(req);

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to fetch employee' });
    }

    const result = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id, first_name, last_name, email, is_active, face_embedding FROM employees WHERE email = ?',
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

    if (result.length === 0) {
      return res.status(200).json({ error: 'Employee not found' });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};


module.exports.updateEmployee = async (req, res) => {
  try {
    const { email, first_name, last_name, is_active, is_admin, face_embedding } = req.body;

    const isAuthenticated = await verifyAuth(req, true);

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to update employee' });
    }

    db.beginTransaction();

    const result = await new Promise((resolve, reject) => {
      db.query(
        'UPDATE employees SET first_name = ?, last_name = ?, is_active = ?, face_embedding = ? WHERE email = ?',
        [first_name, last_name, is_active, face_embedding, email],
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
      db.rollback();
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log(is_admin)

    let adminRole = 'u'
    if (is_admin) {
      adminRole = 'a'
    }

    console.log(adminRole)

    const resultUsers = await new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET role = ? WHERE email = ?',
        [adminRole, email],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    if (resultUsers.affectedRows === 0) {
      db.rollback();
      return res.status(404).json({ error: 'Error updating user' });
    }

    db.commit();
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (err) {
    db.rollback();
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

module.exports.addEmployee = async (req, res) => {
  const { email, first_name, last_name, is_active, is_admin, face_embedding } = req.body;

  const isAuthenticated = await verifyAuth(req, true);

  if (!isAuthenticated) {
    return res.status(403).json({ error: 'Failed to add employee' });
  }

  try {
    db.beginTransaction();

    const result = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO employees (email, first_name, last_name, is_active, face_embedding) VALUES (?, ?, ?, ?, ?)',
        [email, first_name, last_name, is_active, face_embedding],
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
      db.rollback();
      return res.status(500).json({ error: 'Failed to add employee' });
    }
    let role = "u"
    if (is_admin) {
      role = "a"
    }

    const token = req.headers.authorization.replace("Bearer ", "")

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.post(
        `${process.env.SERVER_URL}/api/auth/register`,
        {email , role},
        config
      );
    
      if (response.status != 201) {
        db.rollback();
        return res.status(500).json({ error: 'Failed to add employee' });
      }
    
    } catch (error) {
      db.rollback();
      return res.status(500).json({ error: error });
    }

    db.commit();
    res.status(201).json({ message: 'Employee added successfully' });
  } catch (err) {
    console.error('Error adding employee:', err);
    db.rollback();
    res.status(500).json({ error: 'Failed to add employee' });
  }
};


module.exports.getFaceEmbedding = async (req, res) => {
  try {
    const { image_base64 } = req.body;

    const isAuthenticated = await verifyAuth(req, true);

    if (!isAuthenticated) {
      return res.status(403).json({ error: 'Failed to get face embedding' });
    }

    const result = await new Promise((resolve, reject) => {

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    
      const body = { image_base64: image_base64 };

      axios.post(`${process.env.FACE_EMBEDDING_URL}/getFaceEmbedding`, body, config)
        .then((response) => {
          const data = response.data;

          if (response.status === 200 && data.hasOwnProperty('face_embeddings')) {
            const face_embedding = data.face_embeddings.slice(1, -1);
            resolve(face_embedding);
          } else if (response.status === 200 && data.hasOwnProperty('msg')) {
            reject('No faces detected');
          } else {
            reject('Invalid response');
          }
        })
        .catch((error) => {
          console.error(error);
          reject(error.response.data);
        });
    });

    res.json(result);
  } catch (err) {
    console.error('Error getting face embedding:', err);
    res.status(500).json({ error: 'Failed to get face embedding' });
  }
};


