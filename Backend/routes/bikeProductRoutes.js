const router = require('express').Router();
const bikeProductController = require('../controllers/bikeProductController');
const { authGuard, adminGuard } = require('../middleware/authGuard');
router.post(
  '/create/bike',
  adminGuard,
  bikeProductController.createBikeProduct
);
router.get('/get_all_bikes', bikeProductController.getAllBikes);
router.get('/get_one_bike/:id', authGuard, bikeProductController.getSingleBike);
router.put('/update_bike/:id', adminGuard, bikeProductController.updateBike);
router.delete('/delete_bike/:id', adminGuard, bikeProductController.deleteBike);
router.get('/pagination', bikeProductController.paginationBike);
router.get('/bike_count', bikeProductController.getTotalBike);
router.get('/model/all', bikeProductController.getAllBikeModel);
router.get('/model', bikeProductController.getBikeByModel);

module.exports = router;
