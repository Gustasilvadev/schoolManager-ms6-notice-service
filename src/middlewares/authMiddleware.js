const { verifyToken, extractTokenFromHeader } = require('../utils/jwtHelper');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const authMiddleware = (req, res, next) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.TOKEN_MISSING });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.TOKEN_INVALID });
  }
  req.user = decoded;
  next();
};

module.exports = authMiddleware;