const express = require("express");
const router = express.Router();

const {
  createGrievance,
  getGrievances,
  resolveGrievance,
  deleteGrievance
} = require("../controllers/grievanceController");

// Create grievance
router.post("/", createGrievance);

// Get all grievances
router.get("/", getGrievances);

// Mark resolved
router.put("/:id/resolve", resolveGrievance);

// Delete grievance (admin)
router.delete("/:id", deleteGrievance);

module.exports = router;