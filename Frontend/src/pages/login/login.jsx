import React, { useState } from "react";
import { FaEnvelope, FaLock, FaMotorcycle, FaPhoneAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA component
import {
  forgotPasswordApi,
  loginUserApi,
  resetPasswordApi,
} from "../../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null); // For storing reCAPTCHA token
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = { email, password, recaptchaToken: captchaToken };
    loginUserApi(data)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.location.href = res.data.user.isAdmin
            ? "/admin/dashboard"
            : "/homepage";
        }
      })
      .catch((err) => {
        toast.error(err.response?.data.message || "Something went wrong");
      });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token); // Store the CAPTCHA token
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
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {emailError && (
            <p className="text-red-500 text-xs italic">{emailError}</p>
          )}
          {passwordError && (
            <p className="text-red-500 text-xs italic">{passwordError}</p>
          )}

          {/* reCAPTCHA Widget */}
          <div className="mt-4">
            <ReCAPTCHA
              sitekey="6Lf6I70qAAAAAIBWOMi8J81PmIf2KTZFgKAJ9Iw-" // Replace with your Site Key
              onChange={handleCaptchaChange}
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
    </div>
  );
};

export default Login;
