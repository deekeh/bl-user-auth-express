const express = require("express");
const router = express.Router();
const notes = require("../controllers/notes");

router.post("/", notes.saveNote);

module.exports = router;
