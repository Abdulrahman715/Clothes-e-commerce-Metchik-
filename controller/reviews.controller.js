const asyncwrapper = require('../middleware/asyncwrapper');
const Review = require('../models/reviews.model');

const httpStatusText = require('../utils/httpStatusText');
const appError = require('../utils/appError');

exports.getAllReviews = asyncwrapper(async (req, res, next) => {
    try {
        const productId = req.params.productId;

        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });


        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {
                reviews
            }
        });

    } catch (err) {
        const error = appError.create("product not found", 404, httpStatusText.ERROR);
        return next(error);
    }
});