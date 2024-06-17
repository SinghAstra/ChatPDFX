import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      setIsAuthenticating(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const login = async (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticating(true);
    await verifyToken(token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
  };

  const handleForgotPassword = async (email) => {
    const toastId = toast.loading("Sending email...");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/forgotPassword",
        {
          email,
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error is ", error);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        handleForgotPassword,
        user,
        setUser,
        isAuthenticating,
        setIsAuthenticating,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
