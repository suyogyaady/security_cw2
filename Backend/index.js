// Importing the packages (express)
const express = require("express");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const acceptFormData = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const https = require("https");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const { logRequest } = require("./middleware/activityLogs");

// const http = require("http");

// Creating an express app
const app = express();

//  cors configuration
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//helmet
app.use(helmet());

// Express Json Config
app.use(express.json());

app.use(mongoSanitize());

app.use(xssClean());

app.use(acceptFormData());

app.use(express.static("public"));

// dotenv Configuration
dotenv.config();

// Connecting to database
connectDatabase();

// Defining the port
const PORT = process.env.PORT;

// Making a test endpoint
// Endpoints : POST, GET, PUT , DELETE
app.get("/test", (req, res) => {
  res.send("Test API is Working!....");
});

const options = {
  key: fs.readFileSync(path.resolve(__dirname, "server.key")),
  cert: fs.readFileSync(path.resolve(__dirname, "server.crt")),
};

// Configuring Routes of User
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bike", require("./routes/bikeProductRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
