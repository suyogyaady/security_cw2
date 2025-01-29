const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authGuard, adminGuard } = require("../middleware/authGuard");
const { logRequest } = require("../middleware/activityLogs");

// Route to add item to booking
router.post("/add", authGuard, logRequest, bookingController.addToBooking);

// Route to get all booking items
router.get(
  "/all",
  adminGuard,
  logRequest,
  bookingController.getAllBookingItems
);

// Route to delete item from booking
router.delete(
  "/delete/:id",
  authGuard,
  logRequest,
  bookingController.deleteBookingItem
);

// Route to get user-specific booking items
router.get(
  "/userBooking",

  authGuard,
  logRequest,
  bookingController.getUsersWithBookings
);

// Route to cancle booking
router.put(
  "/cancel/:id",

  authGuard,
  logRequest,
  bookingController.cancelBooking
);

// Route to update booking
router.put(
  "/change_status",

  authGuard,
  logRequest,
  bookingController.updateBooking
);

module.exports = router;
