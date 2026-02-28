const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");

router.post("/", resourceController.addResource);
router.get("/", resourceController.getResources);

module.exports = router;