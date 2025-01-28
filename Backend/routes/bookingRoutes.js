const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authGuard } = require("../middleware/authGuard");
const { logRequest } = require("../middleware/activityLogs");

// Route to add item to booking
router.post("/add", authGuard, bookingController.addToBooking);

// Route to get all booking items
router.get("/all", bookingController.getAllBookingItems);

// Route to delete item from booking
router.delete("/delete/:id", bookingController.deleteBookingItem);

// Route to get user-specific booking items
router.get(
  "/userBooking",
  logRequest,
  authGuard,
  bookingController.getUsersWithBookings
);

// Route to cancle booking
router.put(
  "/cancel/:id",
  logRequest,
  authGuard,
  bookingController.cancelBooking
);

// Route to update booking
router.put(
  "/change_status",
  logRequest,
  authGuard,
  bookingController.updateBooking
);

module.exports = router;
