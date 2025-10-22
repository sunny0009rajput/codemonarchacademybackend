// routes/favourite.js
const express = require("express");
const router = express.Router();
const Favourite = require("../models/Favourite");
const { customerAuth } = require("../middleware/customerAuth");

/**
 * 1️⃣ Add or remove favourite
 * If favourite=true → add, else remove (or mark as not favourite)
 */
router.post("/toggle", customerAuth, async (req, res) => {
  try {
    const { topicId, type, itemId, favourite } = req.body;
    if (!topicId || !type || itemId === undefined)
      return res.status(400).json({ message: "Missing required fields" });

    const updatedFav = await Favourite.findOneAndUpdate(
      { user: req.user.id, topicId, type, itemId: Number(itemId) },
      { favourite },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Favourite updated", favourite: updatedFav });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating favourite", error: err.message });
  }
});

/**
 * 2️⃣ Get all favourites for a chapter
 */
router.get("/:topicId", customerAuth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const favourites = await Favourite.find({
      user: req.user.id,
      topicId,
      favourite: true,
    });

    res.json(favourites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching favourites", error: err.message });
  }
});

module.exports = router;
