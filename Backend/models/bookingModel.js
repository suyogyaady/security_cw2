const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'bikeProduct' },
  bookingAddress: { type: String },
  bikeChasisNumber: { type: String },
  bikeDescription: { type: String },
  bookingTime: { type: Date },
  status: { type: String, default: 'pending' }, 
  total: { type: Number },
  bikeNumber: { type: String },
  // If user-specific bookings are needed
});

const Cart = mongoose.model('booking', bookingSchema);

module.exports = Cart;
