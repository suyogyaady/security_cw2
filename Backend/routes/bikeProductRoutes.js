const router = require("express").Router();
const bikeProductController = require("../controllers/bikeProductController");
const { authGuard, adminGuard } = require("../middleware/authGuard");
const { logRequest } = require("../middleware/activityLogs");

router.post(
  "/create/bike",
  adminGuard,
  logRequest,
  bikeProductController.createBikeProduct
);
router.get("/get_all_bikes", bikeProductController.getAllBikes);
router.get(
  "/get_one_bike/:id",

  authGuard,
  logRequest,
  bikeProductController.getSingleBike
);
router.put(
  "/update_bike/:id",

  adminGuard,
  logRequest,
  bikeProductController.updateBike
);
router.delete(
  "/delete_bike/:id",

  adminGuard,
  logRequest,
  bikeProductController.deleteBike
);
router.get("/pagination", logRequest, bikeProductController.paginationBike);
router.get("/bike_count", logRequest, bikeProductController.getTotalBike);
router.get("/model/all", logRequest, bikeProductController.getAllBikeModel);
router.get("/model", logRequest, bikeProductController.getBikeByModel);

module.exports = router;
