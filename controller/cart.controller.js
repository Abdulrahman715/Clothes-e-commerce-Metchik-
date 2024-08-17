const Cart = require('../models/cart.model');
const Product = require('../models/products.model');
const asyncwrapper = require('../middleware/asyncwrapper');
const appError = require('../utils/appError');
const httpStatusText = require("../utils/httpStatusText");

// Add item to cart
const addToCart = asyncwrapper(async (req, res, next) => {
    const { productId, quantity, color, size } = req.body;

    if (!color) {
        return next(appError.create('Color selection is required', 400, httpStatusText.FAIL));
    }

    if (!size) {
        return next(appError.create('Size selection is required', 400, httpStatusText.FAIL));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(appError.create('Product not found', 404, httpStatusText.FAIL));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = new Cart({
            user: req.user.id,
            items: [{ product: productId, quantity, color, size }],
            totalPrice: product.price * quantity
        });
    } else {
        const existingItemIndex = cart.items.findIndex(
            item => item.product.equals(productId) && item.color === color && item.size === size
        );
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.totalPrice += product.price * quantity;
        } else {
            cart.items.push({ product: productId, quantity, color, size });
            cart.totalPrice += product.price * quantity;
        }
    }

    await cart.save();

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            cart
        }
    });
});



// Remove item from cart
const removeFromCart = asyncwrapper(async (req, res, next) => {
    const { cartProductId } = req.query;

    await Cart.deleteOne({ cartProductId });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
        message: "Product removed from cart successfully",
    });

    
});

// Get user cart
const getCart = asyncwrapper(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
        return next(appError.create('Cart not found', 404, httpStatusText.FAIL));
    }

    // Recalculate total price to ensure accuracy
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    await cart.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            cart
        }
    });
});


module.exports = {
    addToCart,
    removeFromCart,
    getCart
};
