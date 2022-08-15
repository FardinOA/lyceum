const ErrorHandeler = require("../utils/errorHandeler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Mongodb _Id Error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandeler(message, 400);
    }

    // mongo db duplicate key error
    if (err.code === 11000) {
        const message = `You have entered the ${Object.keys(
            err.keyValue
        )} is already active with another account`;
        err = new ErrorHandeler(message, 400);
    }

    // JWT  Error
    if (err.name === "tokenExpireError") {
        const message = `Json web Token is Expired, try again`;
        err = new ErrorHandeler(message, 400);
    }
    // console.log("final", err.message);
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ERROR_HAPPENED: err.stack,
    });
};
