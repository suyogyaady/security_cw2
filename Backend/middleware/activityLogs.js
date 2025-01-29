const Log = require("../models/logModel");
const logRequest = async (req, res, next) => {
  const logEntry = new Log({
    fullName: req.user
      ? req.user.fullName || req.user.email || "Unknown User"
      : "Unknown User",
    url: req.originalUrl,
    method: req.method,
    role: req.user?.role || "User",
    status: res.statusCode,
    time: new Date(),
    headers: req.headers,
    device: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  try {
    await logEntry.save();
  } catch (error) {
    console.error("Error logging request:", error.message);
  }

  next();
};

module.exports = {
  logRequest,
};
