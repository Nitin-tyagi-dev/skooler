const schoolMiddleware = (req, res, next) => {
  if (!req.user || !req.user.schoolId) {
    return res.status(403).json({ message: "School context missing" });
  }

  // Attach schoolId to request for consistent usage
  req.schoolId = req.user.schoolId;

  next();
};

export default schoolMiddleware;
