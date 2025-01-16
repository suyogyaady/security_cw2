const path = require('path');
const bikeProductModel = require('../models/bikeProductModel');
const fs = require('fs');

const createBikeProduct = async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  // Destructuring the body
  const { bikeName, bikeModel, bikePrice } = req.body;
  // Validating the data
  if (!bikeName || !bikeModel || !bikePrice) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  // Validating the image
  if (!req.files || !req.files.bikeImage) {
    return res.status(400).json({ message: 'Please upload an image' });
  }

  const { bikeImage } = req.files;

  //Upload the image and generate new image

  const bikeImageName = `${Date.now()}-${bikeImage.name}`;

  // Upload Path
  const bikeImageUploadPath = path.join(
    __dirname,
    `../public/bikes/${bikeImageName}`
  );

  // Moving the image to the upload path
  try {
    await bikeImage.mv(bikeImageUploadPath);

    // Saving the bike to the database
    const newBike = new bikeProductModel({
      bikeName: bikeName,
      bikeModel: bikeModel,
      bikePrice: bikePrice,
      bikeImage: bikeImageName,
    });

    newBike.save();
    res.status(201).json({
      success: true,
      message: 'Product Created',
      bike: newBike,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'error',
    });
  }
};

// Fetching all bikes from the database
const getAllBikes = async (req, res) => {
  try {
    const bikes = await bikeProductModel.find({});

    res.status(201).json({
      success: true,
      message: 'All Bikes Fetched',
      bikes: bikes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};
// Get all bike model
const getAllBikeModel = async (req, res) => {
  try {
    const bikeModel = await bikeProductModel.find().distinct('bikeModel');
    res.status(201).json({
      success: true,
      message: 'Categories fetched successfully',
      categories: bikeModel,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error,
    });
  }
};

// Fetching a single bike from the database
const getSingleBike = async (req, res) => {
  try {
    const bike = await bikeProductModel.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product Fetched',
      bike: bike,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

const updateBike = async (req, res) => {
  try {
    // if there is image
    if (req.files && req.files.bikeImage) {
      const { bikeImage } = req.files;
      const bikeImageName = `${Date.now()}-${bikeImage.name}`;
      const bikeImageUploadPath = path.join(
        __dirname,
        `../public/bikes/${bikeImageName}`
      );
      // Moving the image to the upload path
      await bikeImage.mv(bikeImageUploadPath);
      req.body.bikeImage = bikeImageName;

      // if image is uploaded and req.body is uploaded
      if (req.body.bikeImage) {
        const existingbike = await bikeProductModel.findByIdAndUpdate(
          req.params.id
        );
        imagePath = path.join(
          __dirname,
          `../public/bikes/${existingbike.bikeImage}`
        );
      }
    }
    const updateBike = await bikeProductModel.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Product Updated',
      updateBike: updateBike,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};
// Deleting a bike from the database
const deleteBike = async (req, res) => {
  try {
    await bikeProductModel.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      message: 'Product Deleted',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

const paginationBike = async (req, res) => {
  const pageNo = req.query.page || 1;
  const resultPerPage = parseInt(req.query.limit) || 2;

  try {
    // get only bikeNames
    const bikes = await bikeProductModel.aggregate([
      {
        $group: {
          _id: '$bikeName',
          data: { $push: '$$ROOT' },
          bikeImage: { $first: '$bikeImage' },
          bikeName: { $first: '$bikeName' },
        },
      },
    ]);

    if (bikes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No product found',
      });
    }
    res.status(201).json({
      success: true,
      message: 'Product Fetched',
      bikes: bikes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

// Get total Bike
const getTotalBike = async (req, res) => {
  try {
    const totalBikes = await bikeProductModel.find({}).countDocuments();
    res.status(201).json({
      success: true,
      message: 'Total Bikes',
      count: totalBikes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error,
    });
  }
};

const getBikeByModel = async (req, res) => {
  const bikeName = req.query.bikeName;
  try {
    const bikes = await bikeProductModel.find({ bikeName: bikeName });
    res.status(200).json({
      success: true,
      message: 'Bikes Model fetched successfully',
      bikes: bikes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error,
    });
  }
};

module.exports = {
  createBikeProduct,
  getAllBikes,
  getSingleBike,
  updateBike,
  deleteBike,
  paginationBike,
  getAllBikeModel,
  getTotalBike,
  getBikeByModel,
};
