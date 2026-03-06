const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");

// Add resource
router.post("/", resourceController.addResource);

// Get resources
router.get("/", resourceController.getResources);

// Delete resource (admin)
router.delete("/:id", resourceController.deleteResource);

module.exports = router;