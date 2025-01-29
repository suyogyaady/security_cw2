const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authGuard = async (req, res, next) => {
  // check incoming data
  console.log(req.headers); //pass
  // get authorization data from headers
  const authHeader = req.headers.authorization;
  // check or validate
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "Auth header is missing",
    });
  }
  // Split the data (Format : 'Bearer token-joyboy') -> only token
  const token = authHeader.split(" ")[1];
  // if token is not found : stop the process (res)
  if (!token || token === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide a token",
    });
  }
  // if token is found then verify
  try {
    const decodeUserData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeUserData;
    const user = await User.findById(decodeUserData.id).select("-password");
    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Not Authenticated",
    });
  }
  // if verified : next (function in controller) // if not verified : not auth
};

// Admin Guard
const adminGuard = async (req, res, next) => {
  console.log(req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "Auth header is missing",
    });
  }
  // Split the data (Format : 'Bearer token-joyboy') -> only token
  const token = authHeader.split(" ")[1];
  // if token is not found : stop the process (res)
  if (!token || token === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide a token",
    });
  }
  // if token is found then verify
  try {
    const decodeUserData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeUserData; // id, is admin

    const user = await User.findById(decodeUserData.id).select("-password");
    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    if (!req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Not Authenticated",
    });
  }
  // if verified : next (function in controller),  // if not verified : not auth
};

module.exports = {
  authGuard,
  adminGuard,
};
