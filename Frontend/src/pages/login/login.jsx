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
  forgotPasswordApi,
  loginUserApi,
  resetPasswordApi,
  verifyotpApi,
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
  const [phone, setPhone] = useState("");
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

          <ReCAPTCHA
            sitekey="6Lf6I70qAAAAAIBWOMi8J81PmIf2KTZFgKAJ9Iw-"
            onChange={setCaptchaToken}
          />

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded"
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
      </div>
    </div>
  );
};

export default Login;
