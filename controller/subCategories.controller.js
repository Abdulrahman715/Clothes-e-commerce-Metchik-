const asyncwrapper = require("../middleware/asyncwrapper");
const SubCategory = require("../models/subCategories.model");
const appError = require("../utils/appError");
const httpStatusText = require('../utils/httpStatusText');

const { validationResult } = require('express-validator');

const getAllSubCategories = asyncwrapper(async (req, res, next) => {
    
    const subCategories = await SubCategory.find();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            subCategories
        }
    })
});

const getSingleSubCategory = asyncwrapper(async (req, res, next) => {
    
    const subCategory = await SubCategory.findById(req.params.subCategoryId);

    if (!subCategory) {
        const error = appError.create("this subCategory not found", 404, httpStatusText.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            subCategory
        }
    });
});

const createSubCategory = asyncwrapper(async (req, res, next) => {
    
    const newSubCategory = await SubCategory.create(req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
        return next(error);
    }

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            newSubCategory
        }
    });
});

const updateSubCategory = asyncwrapper(async (req, res, next) => {
    
    const subCategoryId = req.params.subCategoryId;

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(subCategoryId, { $set: { ...req.body } });

    if (!updatedSubCategory) {
        const error = appError.create("this SubCategory not found", 404, httpStatusText.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            updatedSubCategory
        }
    });
});

const deleteSubCategory = asyncwrapper(async (req, res, next) => {
    await SubCategory.deleteOne({ _id: req.params.subCategoryId });

    res.status(204).json({
        status: httpStatusText.SUCCESS,
        data: null,
        message: "SubCategory is deleted successfully",
    });
})

module.exports = {
    getAllSubCategories,
    getSingleSubCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
}