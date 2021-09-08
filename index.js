require("dotenv").config(); // environment variables from .env
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./routes/auth");
const notes = require("./routes/notes");

const logger = require("./utils/logger");

// middlewares
app.use(express.json());

// routes
app.use("/", auth);
app.use("/notes", notes);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// start server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
  logger.silly(`Server started at ${PORT}`);
});

// connect to database
mongoose.connect(process.env.DB_URL + "bl-users", (err) => {
  if (err) {
    return logger.error("DB Connection error", err);
  }
  return logger.silly("DB Connection successful");
});
