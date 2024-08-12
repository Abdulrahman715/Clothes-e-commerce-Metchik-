const express = require('express');

const router = express.Router();

const productContain = require("../controller/productContainController");


router.route('/')
    .get(productContain.getProductDetails)
    .post(productContain.createProductContain);

router.route('/:productId')
    .patch(productContain.updateProductContain)
    .delete(productContain.deleteProductContain);

module.exports = router;