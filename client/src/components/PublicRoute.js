import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, isAuthenticating } = useContext(AuthContext);

  if (isAuthenticating) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
