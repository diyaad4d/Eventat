const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'phase-2-development-fallback-secret';
    req.user = jwt.verify(token, secret);
  } catch (err) {
    // If token is invalid or expired, just ignore it for optional auth
  }

  next();
};

module.exports = optionalAuthMiddleware;
