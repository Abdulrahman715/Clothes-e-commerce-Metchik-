
const express = require("express");
const router = express.Router();
const favoriteController = require('../controller/favorite.controller');
const verifyToken = require("../middleware/verifyToken");


router.route("/add")
    .get(verifyToken, favoriteController.addToFavorites);

router.route("/remove")
    .delete(verifyToken, favoriteController.removeFromFavorites);

router.route("/list")
    .get(verifyToken, favoriteController.getFavorites);

module.exports = router;
