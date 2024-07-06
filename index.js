import cors from "cors";
import express from "express";
import morgan from "morgan";
// import connectDB from "./database/db.js";
// import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

// app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Auth Server is running." });
});

// connectDB();

app.listen(5000, () => {
  console.log("Server connected to http://localhost:5000");
});
