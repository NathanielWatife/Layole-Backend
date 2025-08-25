const express = require("express");
const router = express.Router();
const { createReview } = require("../controllers/reviewControllers");


router.post("/", createReview);
module.exports = router;