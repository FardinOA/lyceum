const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
        username: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        phone: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: "",
        },
        otpExpires: Date,
        isDeleted: {
            type: Boolean,
            default: false,
        },
        banned: {
            type: Boolean,
            default: false,
        },
        allPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        follower: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
});

//compare password
userSchema.methods.comparePassword = async function (pass) {
    return await bcryptjs.compare(pass, this.password);
};

userSchema.methods.getJWTToken = async function () {
    return jwt.sign(
        { id: this._id, name: this.firstName },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE,
        }
    );
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
