// Importing required packages
const express = require("express");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables first
const connectDatabase = require("./database/database");
const acceptFormData = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const https = require("https");
const session = require("express-session");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

// Creating an Express app
const app = express();
const rateLimit = require("express-rate-limit");

// Define a rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    status: "fail",
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  headers: true,
});

// Apply the rate limit to all routes
app.use(limiter);

// Configuring session securely
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret", // Fallback in case of missing env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production (HTTPS)
      httpOnly: true, // Prevents JavaScript access to cookies for security
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days expiration
    },
  })
);

// CORS Configuration (Handles missing ALLOWED_ORIGINS)
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) // Trim spaces
      : [];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request if origin is valid or missing (Postman, mobile apps)
    } else {
      console.log("🚫 Blocked by CORS: ", origin); // Debugging
      callback(new Error("Not allowed by CORS")); // Block request
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ["GET", "POST", "PUT", "DELETE"], // Restrict allowed methods
  optionsSuccessStatus: 200, // Fixes preflight issues in some browsers
};

app.use(cors(corsOptions));

// Security Middlewares
app.use(
  helmet(
    // Allow static folder
    {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    }
  )
); // Sets security-related HTTP headers
app.use(mongoSanitize()); // Prevents NoSQL injections
app.use(xssClean()); // Prevents XSS attacks

// Express JSON Config & File Upload Handling
app.use(express.json());
app.use(acceptFormData());

// Serving Static Files
app.use(express.static(path.join(__dirname, "public")));

// Connecting to Database
connectDatabase();

// Defining the port with a default fallback
const PORT = process.env.PORT || 5000;

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(
    `Incoming request: ${req.method} ${req.url} from ${req.headers.origin}`
  );
  next();
});

// Test API Endpoint
app.get("/test", (req, res) => {
  res.send("Test API is Working!");
});

// Load SSL Certificates for HTTPS (with error handling)
let options = {};
try {
  options = {
    key: fs.readFileSync(path.resolve(__dirname, "server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "server.crt")),
  };
} catch (error) {
  console.error(" SSL Certificates Not Found. Running on HTTP instead.");
}

// Start HTTPS server if certificates exist, otherwise fallback to HTTP
if (options.key && options.cert) {
  https.createServer(options, app).listen(PORT, () => {
    console.log(` Server is running securely on HTTPS port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on HTTP port ${PORT}`);
  });
}

// Configuring API Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bike", require("./routes/bikeProductRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));

module.exports = app;
