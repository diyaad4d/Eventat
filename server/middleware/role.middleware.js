const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure that authMiddleware has successfully attached the user payload
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: Missing user context' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have the required permissions for this action.' 
      });
    }

    next();
  };
};

module.exports = requireRole;
