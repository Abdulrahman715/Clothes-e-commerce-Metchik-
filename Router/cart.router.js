const express = require('express');
const router = express.Router();

const cartController = require('../controller/cart.controller');
const verifyToken = require('../middleware/verifyToken');

router.route('/productsInCart')
    .get(verifyToken, cartController.getCart)
    
router.route('/add')   
    .post(verifyToken, cartController.addToCart);

router.route('/deleteFromCart')
    .delete(verifyToken, cartController.removeFromCart);

module.exports = router;
