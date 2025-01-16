// controllers/bookingController.js
const path = require('path');
const Booking = require('../models/bookingModel');
const moment = require('moment-timezone');

// Add item to booking
exports.addToBooking = async (req, res) => {
  console.log(req.body);
  console.log(req.user);

  const {
    bikeId,
    bikeChasisNumber,
    bikeDescription,
    bookingDate,
    bookingTime,
    total,
    bikeNumber,
    bookingAddress,
  } = req.body;
  const id = req.user.id;

  // Check if all required fields are present
  if (
    !bikeId ||
    !bikeChasisNumber ||
    !bikeDescription ||
    !bookingDate ||
    !bookingTime ||
    !total ||
    !bikeNumber ||
    !bookingAddress
  ) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Validate and combine date and time
    const combinedDateTime =
      bookingDate.split('T')[0] + 'T' + bookingTime + ':00';

    // Convert to desired GMT (e.g., GMT+5:45 for Nepal)
    const bookingDateTime = moment
      .tz(combinedDateTime, 'Asia/Kathmandu')
      .toDate();
    console.log(bookingDateTime);
    const currentDate = new Date();

    // Check if the booking time is in the past
    if (bookingDateTime < currentDate) {
      return res.status(400).json({ message: 'Enter Valid Date' });
    }

    // Calculate the time window for the booking (2 hours before and after)
    const bookingStartTime = new Date(bookingDateTime);
    bookingStartTime.setHours(bookingStartTime.getHours() - 2);
    const bookingEndTime = new Date(bookingDateTime);
    bookingEndTime.setHours(bookingEndTime.getHours() + 2);

    // Check if there is an existing booking within the time window
    const bookingTimeCheck = await Booking.find({
      bookingTime: {
        $gte: bookingStartTime,
        $lte: bookingDateTime,
      },
    });

    if (bookingTimeCheck.length > 0) {
      return res
        .status(400)
        .json({ message: 'Bike already booked for this time' });
    }

    // Check if the bike is already in booking for the current user
    const itemInBooking = await Booking.findOne({
      bikeNumber: bikeNumber,
      userId: id,
      status: 'pending',
    });

    if (itemInBooking) {
      return res.status(400).json({ message: 'Bike already in booking' });
    }

    // If item is not in booking, add it to booking
    const bookingItem = new Booking({
      bikeId: bikeId,
      chasisNumber: bikeChasisNumber,
      bikeDescription: bikeDescription,
      bookingTime: bookingDateTime,
      bikeNumber: bikeNumber,
      bookingAddress: bookingAddress,
      total: total,
      userId: id,
    });

    await bookingItem.save();
    res.status(200).json({ message: 'Item added to booking' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all booking items
exports.getAllBookingItems = async (req, res) => {
  try {
    //  join booking with bikes
    const bookingItems = await Booking.find({})
      .populate('bikeId')
      .populate('userId');
    res.status(200).json({ bookings: bookingItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete item from booking
exports.deleteBookingItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getUsersWithBookings = async (req, res) => {
  try {
    const users = await Booking.find({ userId: req.user.id })
      .find({ status: 'pending' })
      .populate('userId')
      .populate('bikeId');
    console.log(users);
    res.status(200).json({ users: users });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'canceled';
    await booking.save();

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};
exports.updateBooking = async (req, res) => {
  try {
    const id = req.user.id;
    const booking = await Booking.find({ userId: id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.updateMany({ userId: id }, { status: 'completed' });

    res.status(200).json({ message: 'Booking status successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};
