const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const norificationSchema = new Schema(
    {
        notificationBy: { type: mongoose.Schema.ObjectId, ref: "User" },
        ownar: { type: mongoose.Schema.ObjectId, ref: "User" },
        post: { type: mongoose.Schema.ObjectId, ref: "Post" },
        message: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", norificationSchema);
