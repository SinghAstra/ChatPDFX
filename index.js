import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectDB from "./database/db.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("tiny"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Social API." });
});

connectDB();

app.listen(5000, () => {
  console.log("Server connected to http://localhost:5000");
});
