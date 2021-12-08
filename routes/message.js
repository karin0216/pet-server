const express = require("express");
const message = require("../controllers/messageController");
const verifyToken = require("../middleware/verifyToken");

const route = express.Router();
route.use("/", verifyToken);
route.post("/", message.saveMessages);
route.get("/conversations", message.getAllConversations);
route.post("/conversations", message.addConversation);

route.get("/last/:id", message.getLastMessage);
route.post("/seen/:id", message.seenConversation);
route.get("/:id", message.getAllMessages);
module.exports = route;
