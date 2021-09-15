const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");

router.post("/register", auth.registerUser);

router.post("/login", auth.loginUser);

router.delete("/logout", auth.logoutUser);

router.post("/reset/verify/:token", auth.resetPasswordVerify);
router.post("/reset", auth.resetPassword);

module.exports = router;
