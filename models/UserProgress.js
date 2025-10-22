const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // topicId changed to readable string format like "number_system"
    topicId: { type: String, required: true }, // e.g. "number_system", "algebra"

    completedConcepts: { type: [Number], default: [] },
    completedQuestions: { type: [Number], default: [] },

    totalConcepts: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },

    conceptProgress: { type: Number, default: 0 },
    questionProgress: { type: Number, default: 0 },
    overallProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// prevent duplicate entries per user-topic
userProgressSchema.index({ user: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model("UserProgress", userProgressSchema);
