const jwt = require('jsonwebtoken');

const verifyToken = (token, secret = null) => {
  try {
    const usedSecret = secret || process.env.JWT_SECRET;
    return jwt.verify(token, usedSecret);
  } catch (error) {
    return false;
  }
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

module.exports = { verifyToken, extractTokenFromHeader };