require("dotenv").config(); // environment variables from .env
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./routes/auth");

// middlewares
app.use(express.json());

// routes
app.use("/", auth);

// start server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));


// connect to database
mongoose.connect(process.env.DB_URL+"bl-users", (err) => {
  if (err) {
    return console.error("Connection error", err);
  }
  return console.log("Connection successful");
});
