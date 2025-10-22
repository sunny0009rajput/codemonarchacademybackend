const express = require("express");

const { customerAuth, signToken, getCookieOptions } = require("../middleware/customerAuth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users"); 
const resetPasswordMailCustomer= require("../resetPasswordMailcustomer");
const crypto = require("crypto");

const router = express.Router();


// 👉 Signup (Register customer)
router.post("/signup", async (req, res) => {
  try {
    const { customer_name, email, password, confirmPassword, customer_phone } = req.body;

    if (!customer_name || !email || !password || !confirmPassword || !customer_phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      customer_name,
      email,
      passwordHash: hashedPassword,
      customer_phone
    });

    await newUser.save();

    res.status(201).json({ message: "Signup successful", customerId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Error during signup", error: error.message });
  }
});

// 👉 Login (customer login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const customer = await User.findOne({ email });
    if (!customer) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "User not found or wrong password" });

    // ✅ use shared helper
    const token = signToken({ id: customer._id, email: customer.email, role: "customer" });

    res.cookie("customerToken", token, getCookieOptions());
    res.json({
      message: "Login successful",
      user: { id: customer._id, email: customer.email, role: "customer", customer_name: customer.customer_name,customer_phone: customer.customer_phone },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error.message });
  }
});


// 👉 Get customer profile (requires auth)
router.get("/customerme", customerAuth, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const customer = await User.findById(req.user.id).select("-passwordHash");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json({ user: customer });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

// POST /auth/logout
router.post('/customerlogout', (req, res) => {
  res.clearCookie('customerToken', { ...getCookieOptions(), maxAge: 0 });
  res.json({ message: 'Logged out' });
});


/**
 * Forgot Password (Customer)
 */
router.post("/forgot-password", async (req, res) => {
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const customer = await User.findOne({ email });
  if (!customer) return res.status(404).json({ message: "User not found" });

  const resetToken = customer.generateResetToken();
  await customer.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL_CUSTOMER}/reset-password/${resetToken}`;

  try {
    await resetPasswordMailCustomer(customer.email, customer.customer_name, resetUrl);

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Email could not be sent" });
  }
});

/**
 * Reset Password (Customer)
 */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Please provide new password and confirm it" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log("Incoming token:", token);
console.log("Hashed token:", hashedToken);
  const customer = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!customer) {
    return res.status(400).json({ message: "Token is invalid or expired" });
  }
  console.log("Customer found:", customer);

 // hash the new password
const salt = await bcrypt.genSalt(10);
customer.passwordHash = await bcrypt.hash(password, salt);

// clear reset fields
customer.resetPasswordToken = undefined;
customer.resetPasswordExpires = undefined;

await customer.save();
 // ✅ Clear old cookie so user is forced to log in again
  res.clearCookie("customerToken", { ...getCookieOptions(), maxAge: 0 });

  res.json({ message: "Password reset successful" });
});







module.exports = router;