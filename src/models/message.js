const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        conversationId: {
            type: String,
        },
        messageSender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        senderId: {
            type: String,
        },
        text: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
