const express = require('express');

const router = express.Router();

const subCategoriesController = require('../controller/subCategories.controller');

router.route('/')
    .get(subCategoriesController.getAllSubCategories)
    .post(subCategoriesController.createSubCategory);


router.route('/:subCategoryId')
    .get(subCategoriesController.getSingleSubCategory)
    .patch(subCategoriesController.updateSubCategory)
    .delete(subCategoriesController.deleteSubCategory);

module.exports = router;