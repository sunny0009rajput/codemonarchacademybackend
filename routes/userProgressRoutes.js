const express = require("express");
const router = express.Router();
const UserProgress = require("../models/UserProgress");
const { customerAuth } = require("../middleware/customerAuth");

/**
 * 1️⃣ Initialize topic progress for a user
 * Called when user first visits a topic
 */
router.post("/init",customerAuth, async (req, res) => {
  try {
    const { topicId, totalConcepts, totalQuestions } = req.body;

    if (!topicId)
      return res.status(400).json({ message: "Topic ID is required" });

    let progress = await UserProgress.findOne({
      user: req.user.id,
      topicId,
    });

    if (!progress) {
      progress = new UserProgress({
        user: req.user.id, 
        topicId,
        totalConcepts,
        totalQuestions,
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error initializing progress", error: err.message });
  }
});

/**
 * 2️⃣ Update progress when concept/question checkbox is clicked
 */
router.put("/update",customerAuth, async (req, res) => {
  try {
    const { topicId, type, id, completed } = req.body;
    // type = "concept" or "question"

    let progress = await UserProgress.findOne({
      user: req.user.id,
      topicId,
    });


    // if (!progress)
    //   return res.status(404).json({ message: "Progress not found" });
    if (!progress) {
  progress = new UserProgress({
    user: req.user.id,  // <-- same here
    topicId,
    totalConcepts,
    totalQuestions,
  });
  await progress.save();
}

    if (type === "concept") {
      if (completed && !progress.completedConcepts.includes(id)) {
        progress.completedConcepts.push(id);
      } else if (!completed) {
        progress.completedConcepts = progress.completedConcepts.filter(
          (c) => c !== id
        );
      }
    } else if (type === "question") {
      if (completed && !progress.completedQuestions.includes(id)) {
        progress.completedQuestions.push(id);
      } else if (!completed) {
        progress.completedQuestions = progress.completedQuestions.filter(
          (q) => q !== id
        );
      }
    }

    // calculate progress %
    progress.conceptProgress =
      progress.totalConcepts > 0
        ? (progress.completedConcepts.length / progress.totalConcepts) * 100
        : 0;

    progress.questionProgress =
      progress.totalQuestions > 0
        ? (progress.completedQuestions.length / progress.totalQuestions) * 100
        : 0;

    progress.overallProgress =
      (progress.conceptProgress + progress.questionProgress) / 2;

    await progress.save();

    res.json({
      message: "Progress updated",
      progress,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating progress", error: err.message });
  }
});

/**
 * 3️⃣ Get topic progress
 */
router.get("/:topicId",customerAuth, async (req, res) => {
  try {
    const { topicId } = req.params;
    let progress = await UserProgress.findOne({
      user: req.user.id,
      topicId,
    });

    if (!progress)
      return res
        .status(404)
        .json({ message: "No progress found for this topic" });
    res.json(progress);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching progress", error: err.message });
  }
});

module.exports = router;
