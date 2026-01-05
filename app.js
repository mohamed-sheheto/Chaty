const express = require("express");
const path = require("path");
const morgan = require("morgan");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const AppError = require("./utils/appError");
const errorHandler = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rooms", roomRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
