import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar-container">
      <Link to={"/"}>
        <h1>Social</h1>
      </Link>
      <div className="navbar-links-container">
        <Link to={"/profile"} className="navbar-link">
          <FontAwesomeIcon icon={faUser} className="icon" />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
