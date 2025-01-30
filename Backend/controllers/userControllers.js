const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sentOtp = require("../service/sendOtp");
const sendEmail = require("../service/otpEmailService");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

const nodemailer = require("nodemailer"); // For sending emails

const validator = require("validator"); // For validation and sanitation

// Encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key (must be stored securely)
const IV_LENGTH = 16; // Initialization vector size

// Function to encrypt data
const encryptData = (data) => {
  if (!data) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Store IV with encrypted data
};

// Function to decrypt data
const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  const [iv, encrypted] = encryptedData.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const createUser = async (req, res) => {
  try {
    console.log("Incoming request:", req.body);

    const { fullName, phoneNumber, email, password, recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA token is required!",
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const recaptchaResponse = await axios.post(verifyUrl, null, {
      params: { secret: secretKey, response: recaptchaToken },
    });

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed!",
      });
    }

    if (!fullName || !phoneNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields!",
      });
    }

    if (!validator.isLength(fullName, { min: 3, max: 50 })) {
      return res.status(400).json({
        success: false,
        message: "Full name must be between 3 and 50 characters!",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address!",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be strong (min 8 chars, including uppercase, lowercase, number, and a special character)!",
      });
    }

    const encryptedEmail = encryptData(validator.escape(email));
    const encryptedPhone = encryptData(validator.escape(phoneNumber));

    const existingUser = await userModel.findOne({ email: encryptedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists!",
      });
    }

    const randomSalt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    const newUser = new userModel({
      fullName: validator.escape(fullName),
      phoneNumber: encryptedPhone, // Store encrypted phone number
      email: encryptedEmail, // Store encrypted email
      password: hashedPassword,
      passwordHistory: [hashedPassword], // Initialize password history
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Function to retrieve user details with decryption
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Decrypt email and phone number
    const decryptedEmail = decryptData(user.email);
    const decryptedPhone = decryptData(user.phoneNumber);

    res.status(200).json({
      success: true,
      user: {
        fullName: user.fullName,
        email: decryptedEmail,
        phoneNumber: decryptedPhone,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  console.log(req.body);

  const { email, password, recaptchaToken } = req.body;

  if (!email || !password || !recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields!",
    });
  }

  try {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const recaptchaResponse = await axios.post(verifyUrl, null, {
      params: {
        secret: secretKey,
        response: recaptchaToken,
      },
    });

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed!",
      });
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // Check if the password has expired
    const passwordAge =
      Date.now() - new Date(user.passwordLastUpdated).getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

    if (passwordAge > ninetyDays) {
      return res.status(403).json({
        success: false,
        message: "Your password has expired. Please reset your password.",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // Minutes remaining
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again after ${remainingTime} minute(s).`,
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      user.failedLoginAttempts += 1;

      // Lock account if failed attempts reach 5
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // Lock for 5 minutes
        await user.save();
        return res.status(403).json({
          success: false,
          message:
            "Account locked due to too many failed login attempts. Try again after 5 minutes.",
        });
      }

      await user.save();
      return res.status(400).json({
        success: false,
        message: "Invalid Password!",
      });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Update user with OTP and expiry
    user.googleOTP = otp;
    user.googleOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP for Login",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and OTP.",
    });
  }

  try {
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if OTP matches and is not expired
    if (user.googleOTP !== otp || new Date() > user.googleOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Clear OTP after successful verification
    user.googleOTP = null;
    user.googleOTPExpiry = null;
    await user.save();

    // Store user session
    req.session.user = {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    // Generate token
    const token = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
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
      message: "Internal server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  console.log(req.body);

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Please enter your phone number",
    });
  }
  try {
    const user = await userModel.findOne({ phoneNumber: phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
        message: "Error in sending OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your phone number",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  console.log(req.body);

  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    const user = await userModel.findOne({ phoneNumber: phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetPasswordOTPExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const isPasswordUsed = await Promise.all(
      user.passwordHistory.map(async (oldPassword) => {
        return bcrypt.compare(newPassword, oldPassword);
      })
    );

    if (isPasswordUsed.includes(true)) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse one of your last 5 passwords.",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

    // Update password and history
    user.password = hashedPassword;
    user.passwordHistory.push(hashedPassword);
    user.passwordLastUpdated = Date.now(); // Update timestamp
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "User not found",
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
        message: "Email not sent",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email sent to reset password",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        message: "Please fill all the fields",
      });
    }

    // validate token
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // check if jwt token is valid
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired token",
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
        message: "Password reset successfully!",
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "User not found",
      });
    }

    const jwtToken = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          "1d",
      })
    );

    return res.status(200).json({
      success: true,
      message: "Token generated successfully!",
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
      message: "Please enter all required fields",
    });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user details
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
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
      message: "Internal server error",
    });
  }
};

// Get all user
const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find({ isAdmin: false });

    res.status(201).json({
      success: true,
      message: "All User Fetched",
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
      message: "Please fill all the fields",
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
      const response = await axios.get(picture, { responseType: "stream" });

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
        writer.on("finish", resolve);
        writer.on("error", reject);
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
          "1d",
      })
    );

    return res.status(201).json({
      success: true,
      message: "User Logged In Successfully!",
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
      message: "Internal Server Error!",
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
      message: "Please fill all the fields",
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
        message: "User found",
        data: user,
      });
    }

    res.status(201).json({
      success: true,
      message: "User not found",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: e,
    });
  }
};
// Exporting
module.exports = {
  createUser,
  loginUser,
  verifyOTP,
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
  getUserDetails,
};
