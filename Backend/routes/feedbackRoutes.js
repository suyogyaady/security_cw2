const express = require('express');

const feedbackController = require('../controllers/feedbackController');
const { authGuard } = require('../middleware/authGuard');

const router = express.Router();

router.post('/postFeedback', authGuard, feedbackController.submitFeedback);
router.get('/getFeedback', authGuard, feedbackController.getFeedback);

module.exports = router;
