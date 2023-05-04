const jwt = require("jsonwebtoken")

module.exports.verifyAuth = (req, adminAuth = false) => {
  if (!req.headers.authorization) {
    return false;
  }

  const token = req.headers.authorization.replace("Bearer ", "");

  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ADMIN_SECRET_KEY, (err, decoded) => {
      if (err) {
        if (adminAuth) {
          reject(false);
        } else {
          jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
              reject(false);
            } else {
              resolve(true);
            }
          });
        }
      } else {
        resolve(true);
      }
    });
  });
};

