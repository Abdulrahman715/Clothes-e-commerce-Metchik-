const express = require('express');

const router = express.Router();

const categoriesController = require("../controller/categories.controller");
const verifyToken = require('../middleware/verifyToken');
const allowedTo = require('../middleware/allowedTo');
const userRoles = require('../utils/userRoles');


router.route('/')
    .get(verifyToken,categoriesController.getAllCategories)
    .post(categoriesController.createCategory);

router
    .route("/:categoryId")
    .get(
        verifyToken,
        allowedTo(userRoles.ADMIN, userRoles.MANAGER),
        categoriesController.getSingleCategory
    )
    .patch(categoriesController.updateCategory)
    .delete(categoriesController.deleteCategory);

module.exports = router;