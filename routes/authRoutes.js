const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  registerForAdmin,
} = require("../controllers/authController");

const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

router.post("/register", register);
router.post(
  "/registerAdmin",
  authenticationHandler,
  authorizeUser("admin"),
  registerForAdmin
);
router.delete("/logout", authenticationHandler, logout);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
