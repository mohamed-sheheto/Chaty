const AppError = require("../utils/appError");

const handleCastErrorDb = (err) => {
  let errMsg = `invalid ${err.path}: ${err.value}`;

  return new AppError(errMsg, 400);
};

const handleDuplicateErrorDb = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/g);

  return new AppError(`duplicate field value: ${value}`, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `invalid input data: ${errors.join(". ")}`;

  return new AppError(`${message}`, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid token, please login first", 401);

const handleTokenExpiry = (err) =>
  new AppError("Your token has expired please login again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("ERROR!!! ", err);

    res.status(500).json({
      status: "error",
      message: "something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "dev") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "prod") {
    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateErrorDb(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDb(error);

    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "TokenExpiredError") error = handleTokenExpiry(error);

    sendErrorProd(error, res);
  }
};
