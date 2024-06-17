import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import axios from "axios";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login/Login.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { handleLogIn } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") {
      const passwordValidationResult = validatePassword(value);
      if (passwordValidationResult === true) {
        setIsPasswordValid(true);
      } else {
        setIsPasswordValid(false);
      }
    }
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

  const validateEmail = () => {
    const { email } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = () => {
    const { username } = formData;
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    if (!lengthRegex.test(password)) {
      return "Password must be at least 8 characters long";
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
    const { username, email, password, confirmPassword } = formData;
    if (!username || !email || !password) {
      toast.error("All fields are required");
      return false;
    }
    if (!validateEmail()) {
      toast.error("Invalid email address");
      return false;
    }
    if (!validateUsername()) {
      toast.error(
        "Username can only contain letters, numbers, underscores, and dots"
      );
      return false;
    }
    const passwordValidationResult = validatePassword(password);
    if (passwordValidationResult !== true) {
      toast.error(passwordValidationResult);
      return false;
    }
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/user/register",
          formData
        );
        toast.success(response.data.message);
        handleLogIn(response.data.token);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="body-container">
      <div className="wrapper">
        <h1>Register</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            name="username"
            onChange={handleChange}
          />
          <FontAwesomeIcon icon={faUser} className="w-6" />
        </div>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            name="email"
            onChange={handleChange}
          />
          <FontAwesomeIcon icon={faEnvelope} className="w-6" />
        </div>
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
        {isPasswordValid && (
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
        )}
        <button
          className="btn-login hover:bg-gray-400 text-xl"
          onClick={handleSubmit}
        >
          Register
        </button>
        <p className="text-center text-black my-5 text-lg font-medium">
          Already a member ?{" "}
          <Link to="/login" className="text-cyan-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
