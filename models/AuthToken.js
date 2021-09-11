/*
  NOTE: This file contains model for saving
  the authentication token generated when a
  user gives correct email & password. The
  token was previously generated using an
  in-build function Math.random() which is
  not a very reliable way to generate token
  and needed tokens to be saved in the DB

  Edited by: DK
  Date: 11/09/2021 05:30:00 PM IST
*/

const mongoose = require("mongoose");

const AuthToken = mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("auth-token", AuthToken);
