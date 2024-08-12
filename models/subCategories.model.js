const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
    },
    mainCategory: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("SubCategory", subCategorySchema);