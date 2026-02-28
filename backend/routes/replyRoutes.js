const express = require("express");
const router = express.Router();
const replyController = require("../controllers/replyController");

router.post("/:id", replyController.addReply);
router.get("/:id", replyController.getReplies);

module.exports = router;