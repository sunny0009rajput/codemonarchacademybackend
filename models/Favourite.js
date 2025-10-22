// models/Favourite.js
const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: String, required: true }, // e.g., "number_system"
    type: { type: String, enum: ["concept", "question"], required: true },
    itemId: { type: Number, required: true }, // concept id or question index
    favourite: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure one favourite per user-topic-type-item
favouriteSchema.index({ user: 1, topicId: 1, type: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", favouriteSchema);
