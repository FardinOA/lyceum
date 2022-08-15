const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
    {
        links: [
            {
                type: String,
            },
        ],
        content: String,
        image: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
        likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        tags: [{ type: String }],
        postedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
