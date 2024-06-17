import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login/Login.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="body-container">
      <div className="wrapper">
        <h1>Register</h1>
        <div className="input-box">
          <input type="text" placeholder="Username" />
          <FontAwesomeIcon icon={faUser} className="w-6" />
        </div>
        <div className="input-box">
          <input type="email" placeholder="Email" />
          <FontAwesomeIcon icon={faEnvelope} className="w-6" />
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
        <button className="btn-login hover:bg-gray-400 text-xl">
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
