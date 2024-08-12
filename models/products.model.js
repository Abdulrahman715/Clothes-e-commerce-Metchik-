const mongoose = require('mongoose');
const Counter = require('./counter'); // Adjust the path according to your project structure

const productSchema = new mongoose.Schema({
    title: {
        type: String
    },
    imageUrl: {
        type: String,
        required: [true, "please enter the image of the product"],
    },
    mainCategory: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    discountPrecentage: {
        type: Number,
    },
    shortDescription: {
        type: String,
        default: "this is a product"
    },
    price: {
        type: Number
    }
});

productSchema.pre('save', async function(next) {
    if (!this.title) {
        const counter = await Counter.findOneAndUpdate(
            { name: 'productCounter' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        this.title = `product ${counter.value}`;
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);
