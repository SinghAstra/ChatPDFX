import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logOut } from "../../actions/auth";
import { jwtDecode } from "jwt-decode";

/**
 * The Navbar component represents the application's navigation bar,
 * providing access to key features such as user authentication and profile actions.
 */

const Navbar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  // Effect to check and handle user token expiration
  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) {
        dispatch(logOut());
      }
    }
  }, [dispatch, location, user?.token]);

  const isSignUpPage = location.pathname === "/sign-up";
  const buttonText = isSignUpPage ? "Log In" : "Sign Up";
  const buttonUrl = isSignUpPage ? "/log-in" : "/sign-up";

  return (
    <div className="flex font-mono justify-between items-center py-4 px-6 shadow-lg bg-black text-white w-full z-10">
      <div>
        <h1 className="text-2xl text-violet-400  font-semibold">
          <Link to={"/"}>Social Media Web App</Link>
        </h1>
      </div>
      <div>
        {user ? (
          <Link className="avatar placeholder" to="/app/profile">
            <div className="bg-neutral text-neutral-content rounded-full w-12 border-2 border-purple-400">
              <span className="text-2xl">{user.username[0]}</span>
            </div>
          </Link>
        ) : (
          <Link
            className="bg-black rounded-2xl py-2 px-4 border bottom-2 border-violet-400 hover:bg-violet-400 hover:text-black"
            to={buttonUrl}
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
