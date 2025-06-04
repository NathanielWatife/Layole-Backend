const express = require("express")
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
} = require("../controllers/contactController")
const { validateContact } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.post("/", validateContact, createContact)

// Admin routes (would need authentication middleware in production)
router.get("/", getContacts)
router.get("/stats", getContactStats)
router.get("/:id", getContact)
router.put("/:id", updateContact)
router.delete("/:id", deleteContact)

module.exports = router
