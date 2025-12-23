const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/google", passport.authenticate("google"));
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    session: false,
    failureRedirect: false,
  }),
  authController.googleCallback
);

router.use(authController.protect);
router.get("/", authController.home);

module.exports = router;
