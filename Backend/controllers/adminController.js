const User = require('../models/userModel');
const Bikes = require('../models/bikeProductModel');
const Bookings = require('../models/bookingModel');

const getDashboardStats = async (req, res) => {
  try {
    const totalUserLogins = await User.countDocuments({});
    const totalBikesAdded = await Bikes.countDocuments({});
    const totalBookings = await Bookings.countDocuments({});

    res.status(200).json({
      totalUserLogins,
      totalBikesAdded,
      totalBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};
module.exports = { getDashboardStats };
