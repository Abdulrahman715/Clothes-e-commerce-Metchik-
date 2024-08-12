const asyncwrapper = require("../middleware/asyncwrapper");
const Category = require("../models/categories.model");
const appError = require("../utils/appError");
const httpStatusText = require('../utils/httpStatusText');

const { validationResult } = require('express-validator');

const getAllCategories = asyncwrapper(async (req, res, next) => {
    
    const categories = await Category.find();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            categories
        }
    })
});

const getSingleCategory = asyncwrapper(async (req, res, next) => {
    
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
        const error = appError.create("this category not found", 404, httpStatusText.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            category
        }
    });
});

const createCategory = asyncwrapper(async (req, res, next) => {
    
    const newCategory = await Category.create(req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
        return next(error);
    }

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            newCategory
        }
    });
});

const updateCategory = asyncwrapper(async (req, res, next) => {
    
    const categoryId = req.params.categoryId;

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, { $set: { ...req.body } });

    if (!updatedCategory) {
        const error = appError.create("this category not found", 404, httpStatusText.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            updatedCategory
        }
    });
});

const deleteCategory = asyncwrapper(async (req, res, next) => {
    await Category.deleteOne({ _id: req.params.categoryId });

    res.status(204).json({
        status: httpStatusText.SUCCESS,
        data: null,
        message: "Category is deleted successfully",
    });
})

module.exports = {
    getAllCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory
}