const express = require("express");
const router = express.Router();
const { createNewMessage, getMessage } = require("../controllers/message");

router.post("/message", createNewMessage);
router.get("/message/:conversationId", getMessage);

module.exports = router;
