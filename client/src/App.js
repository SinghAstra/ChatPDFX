import Home from "./components/Home/Home";
import Auth from "./components/Auth/Auth";
import Navbar from "./components/Navbar/Navbar";
import PostDetails from "./components/PostDetails/PostDetails";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Notification from "./components/Notification/Notification";
import { hideNotification } from "./actions/notifications";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";

function App() {
  const { open, message, severity } = useSelector(
    (state) => state.notification
  );
  const handleCloseNotification = () => {
    dispatch(hideNotification());
  };

  const user = useSelector((state) => state.auth.authState);
  const dispatch = useDispatch();

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Navigate to="/posts" />} />
        <Route exact path="/posts" element={<Home />} />
        <Route exact path="/posts/search" element={<Home />} />
        <Route exact path="/posts/:id" element={<PostDetails />} />
        <Route exact path="/log-in" element={<LogIn />} />
        <Route exact path="/sign-up" element={<SignUp />} />
      </Routes>
      <Notification
        open={open}
        onClose={() => {
          handleCloseNotification();
        }}
        message={message}
        severity={severity}
      />
    </ThemeProvider>
  );
}

export default App;
