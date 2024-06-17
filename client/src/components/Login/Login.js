import { faEye, faEyeSlash, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="body-container">
      <div className="wrapper">
        <h1>Login</h1>
        <div className="input-box">
          <input type="text" placeholder="Username" />
          <FontAwesomeIcon icon={faUser} className="w-6" />
        </div>
        <div className="input-box">
          <input type="password" placeholder="Password" />
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
        <button className="btn-login hover:bg-gray-400 text-xl">Log In</button>
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
