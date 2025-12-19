const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createSendToken = function (user, statusCode, res) {
  user.password = undefined;

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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

    const newUser = await User.create({ username, email, password });
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.log("SignUp", err);
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

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "invalid email and password",
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    console.log("login", err);
    next(err);
  }
};
