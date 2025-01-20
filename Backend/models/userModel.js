const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  resetPasswordOTP: {
    type: String,
    default: null,
  },
  resetPasswordOTPExpiry: {
    type: Date,
    default: null,
  },
});

// Pre-save hook to ensure only the last 5 passwords are stored
userSchema.pre("save", function (next) {
  if (this.passwordHistory.length > 5) {
    this.passwordHistory = this.passwordHistory.slice(-5); // Keep only the last 5 entries
  }
  next();
});

const User = mongoose.model("users", userSchema);
module.exports = User;
