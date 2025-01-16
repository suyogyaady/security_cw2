const mongoose = require('mongoose');

bikeProductSchema = new mongoose.Schema({
  bikeName: {
    type: String,
    required: true,
  },
  bikePrice: {
    type: String,
    required: true,
  },
  bikeImage: {
    type: String,
    required: true,
  },
  bikeModel: {
    type: String,
    required: true,
  },
});

const bikeProductModel = mongoose.model('bikeProduct', bikeProductSchema);
module.exports = bikeProductModel;
