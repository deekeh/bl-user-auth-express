const express = require("express");
const router = express.Router();
const notes = require("../controllers/notes");

// authentication middleware to allow logged in users only
const authenticateToken = require("../utils/authenticateToken");
router.use(authenticateToken);

// routes
router.post("/", notes.saveNote);
router.patch("/:id", notes.editNote);
router.get("/", notes.getNotes);
router.patch("/archive/:id", notes.archiveNote);
router.patch("/delete/:id", notes.deleteNote);

module.exports = router;
