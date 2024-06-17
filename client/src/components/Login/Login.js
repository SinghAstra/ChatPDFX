import { faEye, faEyeSlash, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateUsername = () => {
    const { username } = formData;
    if (username.trim() === "") {
      toast.error("Username is required");
      return false;
    } else if (username.includes(" ")) {
      toast.error("Invalid username");
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const { password } = formData;
    const lengthRegex = /.{8,}/;
    const numberRegex = /\d/;
    const upperCaseRegex = /[A-Z]/;
    const lowerCaseRegex = /[a-z]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (
      !lengthRegex.test(password) ||
      !numberRegex.test(password) ||
      !upperCaseRegex.test(password) ||
      !lowerCaseRegex.test(password) ||
      !specialCharRegex.test(password)
    ) {
      toast.error("Incorrect Password");
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogInForm = async () => {
    const { username, password } = formData;
    if (validateUsername() && validatePassword()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/user/login",
          {
            username,
            password,
          }
        );
        localStorage.setItem("token", response.data.token);
        // handleLogIn(response.data.token);
        toast.success(response.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="body-container">
      <div className="wrapper">
        <h1>Login</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <FontAwesomeIcon icon={faUser} className="w-6" />
        </div>
        <div className="input-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="button" onClick={togglePasswordVisibility}>
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="w-6"
            />
          </button>
        </div>
        <div className="remember-forgot">
          <label>
            <input type="checkbox" /> Remember me ?{" "}
          </label>
          <Link to="#" className="hover:underline">
            Forgot Password
          </Link>
        </div>
        <button
          className="btn-login hover:bg-gray-400 text-xl"
          onClick={handleLogInForm}
        >
          Log In
        </button>
        <p className="text-center text-black my-5 text-lg font-medium">
          Don't have an account ?{" "}
          <Link to="/register" className="text-cyan-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
