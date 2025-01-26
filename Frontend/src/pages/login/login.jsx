import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMotorcycle,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import {
  forgotPasswordApi,
  loginUserApi,
  resetPasswordApi,
  verifyotpApi,
} from "../../api/api";

const Login = () => {
  // State for login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [captchaToken, setCaptchaToken] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // State for OTP verification
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // State for password reset
  const [phone, setPhone] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSentOtp, setIsSentOtp] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const validate = () => {
    let isValid = true;
    if (email.trim() === "" || !email.includes("@")) {
      setEmailError("Valid email is required");
      isValid = false;
    } else {
      setEmailError("");
    }
    if (password.trim() === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = { email, password, recaptchaToken: captchaToken };
    try {
      const res = await loginUserApi(data);
      if (res.data.success) {
        setShowOtpModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Something went wrong");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);

    try {
      const res = await verifyotpApi({ email, otp });
      if (res.data.success) {
        toast.success("OTP verified successfully");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = res.data.user.isAdmin
          ? "/admin/dashboard"
          : "/homepage";
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (resetPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const data = { phone, otp, newPassword: resetPassword };
    resetPasswordApi(data)
      .then((res) => {
        toast.success(res.data.message);
        setShowResetModal(false);
        setIsSentOtp(false);
      })
      .catch((err) => {
        toast.error(err.response?.data.message || "Something went wrong");
      });
  };

  const sendOtp = (e) => {
    e.preventDefault();
    forgotPasswordApi({ phone })
      .then((res) => {
        toast.success(res.data.message);
        setIsSentOtp(true);
      })
      .catch((err) => {
        toast.error(err.response?.data.message || "Something went wrong");
      });
  };

  const OtpModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enter OTP</h3>
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              OTP
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isVerifyingOtp}
            >
              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ResetPasswordModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Reset Password
        </h3>
        <form onSubmit={!isSentOtp ? sendOtp : handleReset}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <div className="relative">
              <FaPhoneAlt className="absolute top-3 left-3 text-gray-400" />
              <input
                type="tel"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSentOtp}
              />
            </div>
          </div>
          {isSentOtp && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter new password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => {
                setShowResetModal(false);
                setIsSentOtp(false);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {!isSentOtp ? "Send OTP" : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <FaMotorcycle className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Home Bike Service
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your one-stop solution for bike home servicing
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-2 right-3 text-gray-400 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {emailError && (
            <p className="text-red-500 text-xs italic">{emailError}</p>
          )}
          {passwordError && (
            <p className="text-red-500 text-xs italic">{passwordError}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div className="mt-4">
            <ReCAPTCHA
              sitekey="6Lf6I70qAAAAAIBWOMi8J81PmIf2KTZFgKAJ9Iw-"
              onChange={setCaptchaToken}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
      {showOtpModal && <OtpModal />}
      {showResetModal && <ResetPasswordModal />}
    </div>
  );
};

export default Login;
