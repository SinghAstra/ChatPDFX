import jwt from "jsonwebtoken";

export default function (req, res, next) {
  const authHeader = req.header("Authorization");

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization denied" });
  }
  // Get token from header
  const token = authHeader.split(" ")[1];

  // Check if token doesn't exist
  if (!token) {
    return res.status(401).json({ message: "Authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}
