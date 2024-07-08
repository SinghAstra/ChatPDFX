import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUserController = async (req, res) => {
  const { username, password, email } = req.body;

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Validate input fields
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Username, password, and email are required." });
  }

  if (username.length < 3) {
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters long." });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  try {
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    const uploadProfileImage = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.end(req.file.buffer);
      });
    };

    let profile;
    if (req.file) {
      profile = await uploadProfileImage();
    }

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      profile,
      email,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({ message: "Registered Successfully.", token });
  } catch (error) {
    res.status(500).json({ message: "Error while Registering User." });
  }
};

export const loginUserController = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing credentials
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("token is ", token);

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.log("error is ", error);
    res.status(500).json({ message: "Error while Logging in user." });
  }
};

export const fetchUserInfoUsingEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email }).select("username profile email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user information" });
  }
};

export const fetchUserInfoUsingJWTToken = async (req, res) => {
  try {
    const { username } = req.user;

    // Check if username is provided in the query
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    // Check if user exists in the database
    const user = await User.findOne({ username }).select(
      "username profile email"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user, message: "User Info fetched" });
  } catch (error) {
    res.status(500).json({ message: "Error while fetching user Info." });
  }
};
