// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");



const UserSchema = new mongoose.Schema(
  {
    customer_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    customer_phone: { type: String, required: true },
    
    role: { type: String, default: "customer" },
    

    // reset password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);



// set password (hash)
UserSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

// validate password
UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// generate reset token (returns plain token)
UserSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

module.exports = mongoose.model("User", UserSchema);
