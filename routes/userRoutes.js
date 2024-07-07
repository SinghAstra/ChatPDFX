import express from "express";
import upload from "../config/multer.js";
import { registerUserController } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", upload.single("picture"), registerUserController);
router.get("/testing", (req, res) => {
  res.json({ message: "This is from testing route" });
});

export default router;
