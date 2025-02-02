const router = require("express").Router();
const userController = require("../controllers/userControllers");
const { authGuard, adminGuard } = require("../middleware/authGuard");
// importing log request
const { logRequest } = require("../middleware/activityLogs");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating user login route
router.post("/login", logRequest, userController.loginUser);

router.post("/verify_otp", userController.verifyOTP);

// Creating forgot password route
router.post("/forgot_password", userController.forgotPassword);

// Creating reset password route
router.post("/reset_password", userController.resetPassword);

// Get Current User Profile
router.get(
  "/current_profile",

  authGuard,
  logRequest,
  userController.getCurrentProfile
);

// Get User Token
router.post("/get_user_token", userController.getToken);

// Update User Profile
router.put(
  "/update_profile",
  authGuard,
  logRequest,
  userController.updateUserProfile
);

// Get all User
router.get("/get_all_user", adminGuard, logRequest, userController.getAllUser);

// Forgot Password
router.post("/forgot/email", logRequest, userController.forgotPasswordByEmail);

// Reset Password
router.post("/reset/email", logRequest, userController.resetPasswordByEmail);

// Route to handle google login
router.post("/google", logRequest, userController.googleLogin);
router.post("/getGoogleUser", logRequest, userController.getUserByGoogleEmail);

module.exports = router;
