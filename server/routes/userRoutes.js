import express from "express";
import {
  loginUserController,
  registerUserController,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
// router.post("/forgotPassword", forgotPasswordController);
// router.post("/verifyOTP", verifyOTPController);
// router.post("/resetPassword", resetPasswordController);

// router.get("/", authMiddleware, tokenVerificationController);
// router.get("/:userName", fetchUserController);

// router.put("/updateUser", authMiddleware, updateUserController);

export default router;
