const jwt = require("jsonwebtoken");
const User = require("../src/models/userModel");
const ErrorHandeler = require("../utils/errorHandeler");
const catchAssyncErrors = require("./catchAssyncErrors");
const isAuth = catchAssyncErrors(async (req, res, next) => {
    const { cookieToken } = req.cookies;

    if (!cookieToken) {
        return next(
            new ErrorHandeler("Please login to access this resource", 401)
        );
    }

    const decodedData = jwt.verify(cookieToken, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});

const authRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandeler(
                    `Role: ${req.user.role} is not allowed to access this resource`,
                    403
                )
            );
        }
        next();
    };
};

module.exports = { isAuth, authRole };
