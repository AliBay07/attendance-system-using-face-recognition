const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from('4edebe2016d827fbad402a868b88bfc3089e91e029f2bc1cf9f1025b368b7390', 'hex');
const iv = Buffer.from('08f6da05733521d67e15cc8902101035', 'hex');

function encrypt(data) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

module.exports.encrypt = encrypt;
