const express = require('express');
const blogController = require(("../controllers/blogController"))
const router = express.Router()

router.get("/articles", blogController.getArticles);
router.post("/fetch", blogController.fetchArticles)

module.exports = router;