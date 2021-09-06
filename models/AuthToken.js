const mongoose = require("mongoose");

const AuthToken = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("auth-token", AuthToken);
