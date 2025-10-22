
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const express = require("express");
const router = express.Router();

// 🔒 Secure environment variables
const URLMATH = process.env.URLMATH;
const URLGK = process.env.URLGK;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// ✅ Middleware to validate internal API key


// 🧠 GK API Proxy
// For GK
router.get("/gk/:endpoint", async (req, res) => {
  const endpoint = req.params.endpoint || "chapters"; // fallback if endpoint is missing
  try {
    const response = await axios.get(`${URLGK}/${endpoint}`, {
      headers: { "x-internal-key": INTERNAL_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching GK data:", error.message);
    res.status(500).json({ error: "Failed to fetch GK data" });
  }
});

// Default GK
router.get("/gk", async (req, res) => {
  try {
    const response = await axios.get(`${URLGK}/chapters`, {
      headers: { "x-internal-key": INTERNAL_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching GK data:", error.message);
    res.status(500).json({ error: "Failed to fetch GK data" });
  }
});




// 🧮 Math API Proxy
router.get("/math/:endpoint", async (req, res) => {
  const endpoint = req.params.endpoint || "chapters";
  try {
    const response = await axios.get(`${URLMATH}/${endpoint}`, {
      headers: { "x-internal-key": INTERNAL_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Math data:", error.message);
    res.status(500).json({ error: "Failed to fetch Math data" });
  }
});

router.get("/math", async (req, res) => {
  try {
    const response = await axios.get(`${URLMATH}/chapters`, {
      headers: { "x-internal-key": INTERNAL_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Math data:", error.message);
    res.status(500).json({ error: "Failed to fetch Math data" });
  }
});




module.exports = router;
