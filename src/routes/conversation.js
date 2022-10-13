const express = require("express");
const router = express.Router();
const {
    createNewConversation,
    getConversation,
} = require("../controllers/conversation");

router.post("/conversation", createNewConversation);
router.get("/conversation/:userId", getConversation);

module.exports = router;
