// Importing the packages (express)
const express = require('express');
const connectDatabase = require('./database/database');
const dotenv = require('dotenv');
const acceptFormData = require('express-fileupload');
const cors = require('cors');
const { initSocket } = require('./service/socketService');
const http = require('http');

// Creating an express app
const app = express();

//  cors configuration
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Express Json Config
app.use(express.json());

app.use(acceptFormData());

app.use(express.static('public'));

// dotenv Configuration
dotenv.config();

// Connecting to database
connectDatabase();

// Defining the port
const PORT = process.env.PORT;

// Making a test endpoint
// Endpoints : POST, GET, PUT , DELETE
app.get('/test', (req, res) => {
  res.send('Test API is Working!....');
});

// Configuring Routes of User
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/bike', require('./routes/bikeProductRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notification', require('./routes/notificationRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// http://localhost:5000/api/user
// http://localhost:5000/test

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
initSocket(server); // Initialize Socket.io

// Socket.io connection

// Starting the server (always at the last)
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

module.exports = app;
