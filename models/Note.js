const mongoose = require("mongoose");

const Note = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  creator: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("note", Note);
