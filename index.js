const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");

const PORT = process.env.PORT_URL;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = [
  process.env.FRONTEND_URL_ADMIN,
  process.env.FRONTEND_URL_CUSTOMER,
];

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || FRONTEND_URL.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
// Increase the body size limit
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// database connection

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });



const customerRoutes = require("./routes/customerRoutes");
const userProgressRoutes = require("./routes/userProgressRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");
const proxyRoutes = require("./routes/proxyRoutes");
app.use("/customer", customerRoutes);
app.use("/userprogress", userProgressRoutes);
app.use("/userprogress/favourite", favouriteRoutes);
app.use("/secureapi", proxyRoutes);

module.exports = app;
