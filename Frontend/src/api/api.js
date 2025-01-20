import axios from "axios";

// Creating backend config
const Api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const config = {
  headers: {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};
const jsonConfig = {
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

export const url = "http://localhost:5000";

// Test API
export const testApi = () => Api.get("/test");

// Create API
export const registerUserApi = (data) => Api.post("/api/user/create", data);

// Login API
export const loginUserApi = (data) => Api.post("/api/user/login", data);

// Forgot Password API
export const forgotPasswordApi = (data) =>
  Api.post("/api/user/forgot_password", data);

// Reset Password API
export const resetPasswordApi = (data) =>
  Api.post("/api/user/reset_password", data);

// Update Profile API
export const updateProfileApi = (data) =>
  Api.put("/api/user/update_profile", data, config);

// Get current user API
export const getCurrentUserApi = (id) =>
  Api.get(`/api/user/current_profile`, config);

// Get all users API
export const getAllUsersApi = () => Api.get("/api/user/get_all_user", config);

// =============================== BIKE API ===========================================
// create bike API
export const createBikeApi = (data) =>
  Api.post("/api/bike/create/bike", data, config);

// get all bike API
export const getAllBikeApi = () => Api.get("/api/bike/get_all_bikes", config);

// get bike model
export const getBikeByModel = (bikeName) =>
  Api.get(`api/bike/model?bikeName=${bikeName}`, config);

// get single bike api
export const getSingleBike = (id) =>
  Api.get(`api/bike/get_one_bike/${id}`, config);

// delete bike api
export const deleteBikeApi = (id) =>
  Api.delete(`api/bike/delete_bike/${id}`, config);

// update bike api
export const updateBikeApi = (id, data) =>
  Api.put(`api/bike/update_bike/${id}`, data, config);

// pagination
export const paginationApi = (page, limit) =>
  Api.get(`/api/bike/pagination?page=${page}&limit=${limit}`, config);

//
export const bikeCount = () => {
  return Api.get(`/api/bike/bike_count`, config);
};

// =============================== Bookings API ===========================================

// Add to Boking API
export const addToBookingApi = (data) =>
  Api.post("/api/booking/add", data, config);

// Display Booking
export const getAllBookingApi = () => Api.get("/api/booking/all", config);

// Delete Booking
export const deleteBookingApi = (id) => Api.delete(`/api/booking/delete/${id}`);

// User Booking
export const userBookingApi = (id) =>
  Api.get(`/api/booking/userBooking`, config);

export const cancelBookingApi = (id) => {
  return axios.put(`/api/booking/cancel/${id}`, config);
};

// ============================= Admin Panel ===========================================

export const getDashboardStats = () =>
  Api.get("/api/admin/dashboard_stats", config);

// =============================== Notification =========================
export const getNotificationApi = () =>
  Api.get(`/api/notifications/get`, config);

export const readNotificationApi = (id) =>
  Api.put(`/api/notifications/read/${id}`, config);

// ================================ send notification =======================
export const sendNotificationApi = (data) =>
  Api.post(`/api/notifications/send`, data, jsonConfig);

// ================================ Feedback API ==============================

export const sendFeedbackApi = (data) =>
  Api.post("/api/feedback/postFeedback", data, config);

export const getFeedbackApi = () =>
  Api.get("/api/feedback/getFeedback", config);

// =================== Payment ======================
export const initializeKhaltiPaymentApi = (data) =>
  Api.post("/api/payment/initialize_khalti", data, jsonConfig);
