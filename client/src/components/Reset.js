import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const Reset = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!location.state) {
    return <Navigate to="/login" />;
  }

  const { username } = location.state;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const lengthRegex = /.{8,}/;
  const numberRegex = /\d/;
  const upperCaseRegex = /[A-Z]/;
  const lowerCaseRegex = /[a-z]/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  const isPasswordValid = () => {
    const { password } = formData;
    if (!lengthRegex.test(password)) {
      return "Password must be at least 8 characters";
    }
    if (!numberRegex.test(password)) {
      return "Password must contain at least one number";
    }
    if (!upperCaseRegex.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!lowerCaseRegex.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character";
    }
    return true;
  };

  const validateForm = () => {
    const { password, confirmPassword } = formData;
    const res = isPasswordValid();
    if (res !== true) {
      toast.error(res);
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/user/resetPassword",
          {
            username,
            newPassword: formData.password,
          }
        );
        toast.success(response.data.message);
        navigate("/login");
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };
  return (
    <div className="body-container">
      <div className="wrapper">
        <h1>Reset Password</h1>
        <div className="input-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            name="password"
            onChange={handleChange}
          />
          <button type="button" onClick={togglePasswordVisibility}>
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="w-6"
            />
          </button>
        </div>
        <div className="input-box">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
          />
          <button type="button" onClick={toggleConfirmPasswordVisibility}>
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              className="w-6"
            />
          </button>
        </div>
        <button
          className="btn-login hover:bg-gray-400 text-xl"
          onClick={handleSubmit}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default Reset;
