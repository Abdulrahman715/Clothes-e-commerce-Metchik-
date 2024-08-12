const express = require('express');

const router = express.Router();

const userController = require('../controller/users.controller');
const authController = require('../controller/auth.controller');

const verifyToken = require('../middleware/verifyToken');

router.route('/signUp')
    .post(authController.signUp);

router.route("/login")
    .post(authController.login);

router.route("/forgotPassword")
    .post(authController.forgetPassword);

router.route('/resetPassword/:token')
    .patch(authController.resetPassword);

router.route("/changeMyPassword/:id")
    .patch(verifyToken, authController.updatePassword);

router.route("/signOut")
    .delete(verifyToken, authController.signOut);

router.route('/')
    .get(userController.getAllUsers)

router.route('/:userId')
    .get(userController.getSingleUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;