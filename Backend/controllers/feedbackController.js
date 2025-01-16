const Feedback = require('./../models/feedbackModel');

exports.submitFeedback = async function (req, res) {
  const userId = req.user.id;
  try {
    const { subject, message, rating } = req.body;
    const feedback = new Feedback({
      userId,
      subject,
      message,
      rating,
    });
    const savedFeedback = await feedback.save();
    res.status(201).json({ feedback: savedFeedback });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFeedback = async function (req, res) {
  try {
    const feedback = await Feedback.find({}).populate('userId');
    res.json({ feedback });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
