import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA component
import zxcvbn from "zxcvbn"; // Import zxcvbn for password strength checking
import { registerUserApi } from "../../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Icons for password toggle

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null); // State to store CAPTCHA token
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for password toggle
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password toggle
  const [passwordStrength, setPasswordStrength] = useState(null); // Password strength state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Calculate password strength
    if (name === "password") {
      const strength = zxcvbn(value);
      setPasswordStrength(strength); // Store the full strength object
    }
  };

  const validate = () => {
    let newErrors = {};
    const { fullName, email, phoneNumber, password, confirmPassword } =
      formData;

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    else if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords don't match";
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      newErrors.captcha = "CAPTCHA is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await registerUserApi({
          ...formData,
          recaptchaToken: captchaToken,
        });
        if (response.data.success) {
          toast.success(response.data.message);
          // Redirect to login or dashboard
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error || "Failed to create account");
      }
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token); // Store CAPTCHA token
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const getPasswordStrengthLabel = () => {
    if (!passwordStrength) return "";
    const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    return strengthLabels[passwordStrength.score];
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "bg-gray-200";
    const colors = [
      "bg-red-500",
      "bg-orange-400",
      "bg-yellow-400",
      "bg-green-500",
      "bg-green-700",
    ];
    return colors[passwordStrength.score];
  };

  const getPasswordStrengthWidth = () => {
    if (!passwordStrength) return "w-0";
    return `${(passwordStrength.score + 1) * 20}%`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join us and start your journey
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {["fullName", "email", "phoneNumber"].map((field) => (
              <div key={field} className="mb-4">
                <label htmlFor={field} className="sr-only">
                  {field.charAt(0).toUpperCase() +
                    field
                      .slice(1)
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field === "email" ? "email" : "text"}
                  autoComplete={field === "email" ? "email" : ""}
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors[field] ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder={
                    field.charAt(0).toUpperCase() +
                    field
                      .slice(1)
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                  }
                  onChange={handleChange}
                  value={formData[field]}
                />
                {errors[field] && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Password Field */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.password}
                </p>
              )}

              {/* Password Strength Bar */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: getPasswordStrengthWidth() }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      passwordStrength.score < 2
                        ? "text-red-500"
                        : passwordStrength.score < 4
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {getPasswordStrengthLabel()}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-4 relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                onChange={handleChange}
                value={formData.confirmPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* reCAPTCHA Widget */}
          <div className="mt-4">
            <ReCAPTCHA
              sitekey="6Lf6I70qAAAAAIBWOMi8J81PmIf2KTZFgKAJ9Iw-" // Replace with your Site Key
              onChange={handleCaptchaChange}
            />
            {errors.captcha && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.captcha}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
