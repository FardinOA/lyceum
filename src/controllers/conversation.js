const catchAssyncErrors = require("../../middlewares/catchAssyncErrors");
const ErrorHandeler = require("../../utils/errorHandeler");
const Conversation = require("../models/conversation");

exports.createNewConversation = catchAssyncErrors(async (req, res, next) => {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
    });
    const conversation = await Conversation.find({
        $and: [
            { members: { $in: [req.body.senderId] } },
            { members: { $in: [req.body.receiverId] } },
        ],
    });

    if (conversation.length >= 1)
        return next(new ErrorHandeler("Already have a conversation", 409));

    const isSave = await newConversation.save();

    if (!isSave)
        return next(new ErrorHandeler("Can't Create Conversition", 404));
    res.status(200).json({
        message: `Conversation created successfully with ${req.body.receiverName}`,
    });
});

exports.getConversation = catchAssyncErrors(async (req, res, next) => {
    const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
    });

    if (!conversation) return next(new ErrorHandeler("No Conversition", 403));

    res.status(200).json({
        conversation,
    });
});
