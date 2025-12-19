const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");

const router = express.Router();

router.post("/signUp", authController.signUp);
router.post("/login", authController.login);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get("/google", passport.authenticate("google"));
  router.get(
    "/google/redirect",
    passport.authenticate("google", {
      session: false,
      failureRedirect: false,
    }),
    authController.googleCallback
  );
}

module.exports = router;
