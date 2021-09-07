const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "silly",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "warn.log"),
      level: "warn",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "info.log"),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "warn.log"),
      level: "warn",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "http.log"),
      level: "http",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "verbose.log"),
      level: "verbose",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "debug.log"),
      level: "debug",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "silly.log"),
      level: "silly",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "combined.log"),
    }),
  ],
});

module.exports = logger;
