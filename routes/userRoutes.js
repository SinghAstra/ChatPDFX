import express from "express";
import upload from "../config/multer.js";
import {
  fetchUserInfoUsingEmail,
  fetchUserInfoUsingJWTToken,
  loginUserController,
  registerUserController,
  resetPasswordController,
  sendOTPController,
  verifyOTPController,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", upload.single("picture"), registerUserController);
router.post("/login", loginUserController);
router.post("/fetch-user-info", fetchUserInfoUsingEmail);
router.post("/verify-token", authMiddleware, fetchUserInfoUsingJWTToken);
router.post("/sendOTP", sendOTPController);
router.post("/verifyOTP", verifyOTPController);
router.post("/reset-password", resetPasswordController);

router.get("/testing", async (req, res) => {
  const users = await User.find();

  res.json({ message: "Fetched All Users", users });
});

export default router;
