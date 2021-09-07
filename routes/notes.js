const express = require("express");
const router = express.Router();
const notes = require("../controllers/notes");

router.post("/", notes.saveNote);
router.get("/", notes.getNotes);

module.exports = router;
