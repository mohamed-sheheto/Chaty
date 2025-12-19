const User = require("../models/userModel");
const Google = require("../models/googleModel");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const validator = require("validator");
const googleStrategy = require("passport-google-oauth20").Strategy;

const createSendToken = function (user, statusCode, res) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  user.password = undefined;

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });

  const cookieExpiresIn = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 10;

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signUp = async function (req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "please provide username, email and password",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    const newUser = await User.create({ username, email, password });
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error("SignUp error:", err);
    next(err);
  }
};
exports.login = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "please provide email and password",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "invalid email and password",
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:3000/api/v1/auth/google/redirect",
        scope: ["profile"],
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const findUser = await Google.findOne({ googleId: profile.id });
          if (!findUser) {
            const newUser = await Google.create({
              username: profile.displayName,
              googleId: profile.id,
            });

            return cb(null, newUser);
          }

          return cb(null, findUser);
        } catch (err) {
          console.error("Google auth error:", err);
          return cb(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    "Warning: Google OAuth credentials not found. Google authentication will not be available."
  );
}

exports.googleCallback = function (req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Google authentication failed",
      });
    }

    createSendToken(req.user, 200, res);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred during authentication",
    });
  }
};
