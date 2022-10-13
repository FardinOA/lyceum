const Message = require("../models/message");

const createNewMessage = async (req, res) => {
    try {
        const newMassage = new Message({
            ...req.body,
        });
        const isSave = await newMassage.save();
        let message;
        if (isSave)
            message = await Message.findById(isSave._id).populate(
                "messageSender"
            );

        res.send(message);
    } catch (error) {
        res.send({ error });
    }
};

const getMessage = async (req, res) => {
    try {
        const message = await Message.find({
            conversationId: req.params.conversationId,
        }).populate("messageSender");
        console.log(message);
        res.send(message);
    } catch (error) {
        res.send({ error });
    }
};

module.exports = {
    createNewMessage,
    getMessage,
};
