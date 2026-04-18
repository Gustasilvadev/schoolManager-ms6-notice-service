const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.TOKEN_MISSING });
    }
    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN });
    }
    next();
  };
};

module.exports = roleMiddleware;