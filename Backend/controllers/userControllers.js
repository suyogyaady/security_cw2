const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sentOtp = require('../service/sendOtp');
const sendEmail = require('../service/otpEmailService');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const createUser = async (req, res) => {
  // 1. Check incoming data
  console.log(req.body);

  // 2. DesStructure the incoming data
  const { fullName, phoneNumber, email, password } = req.body;

  // 3. Validate the data (if empty, stop the process and send response)
  if (!fullName || !phoneNumber || !email || !password) {
    // res.send("Please enter all fields");
    return res.status(400).json({
      success: false,
      message: 'Please enter all fields!',
    });
  }

  // 4. Error Handling(try catch)
  try {
    // 5. Check if the user is already registered
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      return res.json({
        success: false,
        message: 'User Already Exists',
      });
    }

    // Hash the password
    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    // 5.2 if user is new
    const newUser = new userModel({
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email,
      password: hashedPassword,
    });
    // Save to database
    await newUser.save();

    // Send the response
    res.status(201).json({
      success: true,
      message: 'User Created Successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const loginUser = async (req, res) => {
  // 1. Check incoming data
  console.log(req.body);

  // 2. DesStructure the incoming data
  const { email, password } = req.body;

  // 3. Validate the data (if empty, stop the process and send response)
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please enter all fields!',
    });
  }
  try {
    // 4. Check if the user is already registered
    const user = await userModel.findOne({ email: email });
    // found data: fullName, phoneNumber, email, password

    // 4.1 if user not found: Send response
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    // 4.2 if user found
    // 5. Check if the password is correct
    const passwordCorrect = await bcrypt.compare(password, user.password);
    // 5.1 if password is wrong: Send response
    if (!passwordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Password',
      });
    }

    // 5.2 if password is correct

    
    // Token (generate -user data and key)
    const token = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );
    // Send the response (token, user data)
    res.status(201).json({
      success: true,
      message: 'User logged in successfully',
      token: token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
// Forgot password by using phonenumber

const forgotPassword = async (req, res) => {
  console.log(req.body);

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Please enter your phone number',
    });
  }
  try {
    const user = await userModel.findOne({ phoneNumber: phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    // Generate OTP
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    console.log(randomOTP);

    user.resetPasswordOTP = randomOTP;
    user.resetPasswordOTPExpiry = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send OTP to user phone number
    const isSent = await sentOtp(phone, randomOTP);

    if (!isSent) {
      return res.status(400).json({
        success: false,
        message: 'Error in sending OTP',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone number',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const resetPassword = async (req, res) => {
  console.log(req.body);

  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please enter all fields',
    });
  }

  try {
    const user = await userModel.findOne({ phoneNumber: phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (user.resetPasswordOTPExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Forget Password by using email
const forgotPasswordByEmail = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    // sent email service
    const userEmail = req.body.email; // Assuming email is submitted via a form
    const token = generateToken(); // You need to implement generateToken() function

    // Construct reset link
    // const resetLink = `http://localhost:5000/api/user/reset?token=${token}&email=${userEmail}`;
    const resetLink = `http://192.168.18.7:5000/api/user/reset?token=${token}&email=${userEmail}`;

    // send email
    const emailSent = await sendEmail(userEmail, resetLink);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Email not sent',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent to reset password',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

// Reset Password by using email
const resetPasswordByEmail = async (req, res) => {
  try {
    console.log(req.body);
    const { token, email, password } = req.body;

    // Validate
    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all the fields',
      });
    }

    // validate token
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    // check if jwt token is valid
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // update password
      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, randomSalt);

      await userModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully!',
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

//Get Current Profile
const getCurrentProfile = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      user: user,
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

// Get User Token
const getToken = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const jwtToken = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          '1d',
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Token generated successfully!',
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};
const updateUserProfile = async (req, res) => {
  const { fullName, email, phoneNumber } = req.body;
  const id = req.user.id; // Assuming you have middleware to get userId from token

  if (!fullName || !email || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Please enter all required fields',
    });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user details
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all user
const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find({ isAdmin: false });

    res.status(201).json({
      success: true,
      message: 'All User Fetched',
      users: users,
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

const googleLogin = async (req, res) => {
  console.log(req.body);

  // Destructuring the data
  const { token } = req.body;

  // Validate
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  // try catch
  try {
    // verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    let user = await userModel.findOne({ email: email });

    if (!user) {
      const { password, role } = req.body;

      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, randomSalt);

      // Fetch the image from Google
      const response = await axios.get(picture, { responseType: 'stream' });

      // Set up image name and path
      const imageName = `${given_name}_${family_name}_${Date.now()}.png`;
      const imagePath = path.join(__dirname, `../public/profile/${imageName}`);

      // Ensure the directory exists
      const directoryPath = path.dirname(imagePath);
      fs.mkdirSync(directoryPath, { recursive: true });

      // Create a write stream to save the image
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      // Wait for the image to be fully saved
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      user = new userModel({
        firstName: given_name,
        lastName: family_name,
        email: email,
        password: hashedPassword,
        role: role,
        image: imageName,
        fromGoogle: true,
      });
      await user.save();
    }

    // generate token
    const jwtToken = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          '1d',
      })
    );

    return res.status(201).json({
      success: true,
      message: 'User Logged In Successfully!',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
      error: error,
    });
  }
};

const getUserByGoogleEmail = async (req, res) => {
  console.log(req.body);

  // Destructuring the data
  const { token } = req.body;

  // Validate
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }
  try {
    // verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log(ticket);

    const { email } = ticket.getPayload();

    const user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(200).json({
        success: true,
        message: 'User found',
        data: user,
      });
    }

    res.status(201).json({
      success: true,
      message: 'User not found',
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: e,
    });
  }
};
// Exporting
module.exports = {
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentProfile,
  getToken,
  updateUserProfile,
  getAllUser,
  forgotPasswordByEmail,
  resetPasswordByEmail,
  googleLogin,
  getUserByGoogleEmail,
};
