const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const asyncwrapper = require('./asyncwrapper');
const appError = require('../utils/appError');
const httpStatusText = require("../utils/httpStatusText");

const User = require('../models/users.model');

const verifyToken = asyncwrapper(async (req, res, next) => {

    let token;
    
    //getting token and check of it's here
    const authHeader = req.headers["Authorization"] || req.headers["authorization"];

    token = authHeader.split(" ")[1];

    if (!token) {
        const error = appError.create('you are not logged in! Please log in to get access (token is required)', 401, httpStatusText.FAIL);
        return next(error);
    }


    const decodedUser = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY
    );


    // check if user still exists

    const freshUser = await User.findById(decodedUser.id);
    if (!freshUser) {
        const error = appError.create('the user belonging to this token does not longer exist!', 401, httpStatusText.FAIL);
        return next(error);
    }

    if (freshUser.changedPasswordAfter(decodedUser.id)) {
        const error = appError.create('User Recently changed password ! , please login again . ', 401, httpStatusText.FAIL);
        return next(error);
    }
    
    req.user = freshUser;
    next();

});

module.exports = verifyToken;