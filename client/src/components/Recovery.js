import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const Recovery = () => {
  const [formData, setFormData] = useState({
    username: "",
    otp: "",
  });
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateUsername = () => {
    const { username } = formData;
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    return usernameRegex.test(username);
  };

  const validateOTP = () => {
    const { otp } = formData;

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast.error("Invalid OTP");
      return false;
    }

    return true;
  };

  const handleSendEmail = async () => {
    const { username } = formData;
    if (validateUsername()) {
      const toastId = toast.loading("Wait...");
      try {
        const response = await axios.post(
          "http://localhost:5000/api/user/forgotPassword",
          {
            username,
          }
        );
        toast.success(response.data.message);
        setStep(2);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log("error is ", error);
      } finally {
        toast.dismiss(toastId);
      }
    }
  };

  const handleVerifyOTP = async () => {
    const { username, otp } = formData;
    if (validateOTP()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/user/verifyOTP",
          {
            username,
            otp,
          }
        );
        toast.success(response.data.message);
        navigate("/reset", {
          state: {
            username,
          },
        });
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="body-container">
      <div className="wrapper">
        <h1>Recover Account</h1>
        {step === 1 && (
          <>
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
            <button
              className="btn-login hover:bg-gray-400 text-xl"
              onClick={handleSendEmail}
            >
              Send Email
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="input-box">
              <input
                type="text"
                placeholder="OTP"
                value={formData.otp}
                name="otp"
                onChange={handleChange}
              />
            </div>
            <button
              className="btn-login hover:bg-gray-400 text-xl"
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </button>
            <p className="text-center text-black my-5 text-lg font-medium">
              Email Not Sent ?{" "}
              <button onClick={handleSendEmail} className="text-cyan-400">
                Resend Email
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Recovery;
