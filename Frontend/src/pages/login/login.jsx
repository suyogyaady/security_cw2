import React, { useState } from "react";
import DOMPurify from "dompurify";
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
  loginUserApi,
  forgotPasswordByEmailApi,
  verifyotpApi,
  resetPasswordApi,
} from "../../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSentOtp, setIsSentOtp] = useState(false);

  const validate = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await loginUserApi({
        email: DOMPurify.sanitize(email),
        password: DOMPurify.sanitize(password),
        recaptchaToken: captchaToken,
      });
      if (res.data.success) {
        setShowOtpModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Something went wrong");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    try {
      const res = await verifyotpApi({
        email: DOMPurify.sanitize(email),
        otp: DOMPurify.sanitize(otp),
      });
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

  const handleReset = async (e) => {
    e.preventDefault();
    if (resetPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await resetPasswordApi({
        email: DOMPurify.sanitize(resetEmail),
        otp: DOMPurify.sanitize(otp),
        newPassword: DOMPurify.sanitize(resetPassword),
      });
      if (res.data.success) {
        toast.success("Password reset successfully");
        setShowResetModal(false);
        setIsSentOtp(false);
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Something went wrong");
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPasswordByEmailApi({
        email: DOMPurify.sanitize(resetEmail),
      });
      if (res.data.success) {
        toast.success("OTP sent successfully");
        setIsSentOtp(true);
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Something went wrong");
    }
  };

  const ResetPasswordModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Reset Password
        </h3>
        <form onSubmit={!isSentOtp ? sendOtp : handleReset}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
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
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl">
        <div className="text-center">
          <FaMotorcycle className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Home Bike Service
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              className="w-full px-10 py-2 border rounded"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-10 py-2 border rounded"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </button>
          </div>

          <ReCAPTCHA
            sitekey="6Lf6I70qAAAAAIBWOMi8J81PmIf2KTZFgKAJ9Iw-"
            onChange={setCaptchaToken}
          />

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>

        {showOtpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <h3>Enter OTP</h3>
              <input
                type="text"
                className="w-full border p-2 mt-2"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  className="px-4 py-2 bg-indigo-600 text-white rounded ml-2"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/register" className="text-indigo-600">
            Don't have an account? Sign up
          </Link>
        </div>

        {showResetModal && <ResetPasswordModal />}
      </div>
    </div>
  );
};

export default Login;
