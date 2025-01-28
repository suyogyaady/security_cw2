const express = require('express');

const feedbackController = require('../controllers/feedbackController');
const { authGuard } = require('../middleware/authGuard');
const { logRequest } = require("../middleware/activityLogs");

const router = express.Router();

router.post(
  "/postFeedback",
  logRequest,
  authGuard,
  feedbackController.submitFeedback
);
router.get(
  "/getFeedback",
  logRequest,
  authGuard,
  feedbackController.getFeedback
);

module.exports = router;
