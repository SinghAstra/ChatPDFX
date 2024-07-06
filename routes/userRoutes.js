import express from "express";
import { registerUserController } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUserController);
router.get("/testing", (req, res) => {
  res.json({ message: "This is from testing route" });
});

export default router;
