// middleware/customerAuth.js
const jwt = require("jsonwebtoken");

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // only true in production with HTTPS
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

/**
 * Middleware to authenticate customer
 */
const customerAuth = (req, res, next) => {
  // Prefer header: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.customerToken) {
    token = req.cookies.customerToken;
  }



  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== "customer") {
      return res.status(403).json({ message: "Forbidden: Customers only" });
    }
    req.user = decoded; // { id, email, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { customerAuth, signToken, getCookieOptions };
