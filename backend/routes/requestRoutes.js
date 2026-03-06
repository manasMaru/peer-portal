const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

// Create new request
router.post("/", requestController.createRequest);

// Get all requests
router.get("/", requestController.getRequests);

// Offer resource to a request
router.put("/:id/offer", requestController.offerResource);

// Mark request as received
router.put("/:id/received", requestController.markReceived);
router.delete("/:id", requestController.deleteRequest);

module.exports = router;