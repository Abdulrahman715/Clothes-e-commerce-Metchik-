const express = require("express");

const reviewController = require("../controller/reviews.controller");

const router = express.Router();

router.route("/:productId/reviews")
    .get(reviewController.getAllReviews);

module.exports = router;
