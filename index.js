import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectDB from "./database/db.js";
dotenv.config({ path: "./.env" });
// import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

// app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Social API." });
});

connectDB();

app.listen(5000, () => {
  console.log("Server connected to http://localhost:5000");
});
