const Joi = require("joi");

const register = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string(),
    userName: Joi.string().alphanum().min(3).max(20),
    email: Joi.string().email().required(),
    phone: Joi.string()
        .pattern(/^(?:\+?88|0088)?01[15-9]\d{8}$/)
        .message("This is not a valid phone number")
        .required(),
    password: Joi.string().required().min(5).max(30),
    avatar: Joi.string(),
    isVerified: Joi.boolean(),
    otp: Joi.string().default(""),
    isDeleted: Joi.boolean().default(false),
    banned: Joi.boolean().default(false),
    allPosts: Joi.array(),
    following: Joi.array(),
    follower: Joi.array(),
});

const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(5).max(30),
});

const updatePasswordValidator = Joi.object({
    currentPassword: Joi.string().required().min(5).max(30),
    newPassword: Joi.string().required().min(5).max(30),
    confirmNewPassword: Joi.string().required().min(5).max(30),
});

const resetPasswordValidator = Joi.object({
    newPassword: Joi.string().required().min(5).max(30),
    confirmNewPassword: Joi.string().required().min(5).max(30),
});

const emailValidator = Joi.object({
    email: Joi.string().email().required(),
});

module.exports = {
    register,
    login,
    updatePasswordValidator,
    resetPasswordValidator,
    emailValidator,
};
