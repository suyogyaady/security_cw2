const express = require("express");

const feedbackController = require("../controllers/feedbackController");
const { authGuard } = require("../middleware/authGuard");
const { logRequest } = require("../middleware/activityLogs");

const router = express.Router();

router.post(
  "/postFeedback",

  authGuard,
  logRequest,
  feedbackController.submitFeedback
);
router.get(
  "/getFeedback",

  authGuard,
  logRequest,
  feedbackController.getFeedback
);

module.exports = router;
