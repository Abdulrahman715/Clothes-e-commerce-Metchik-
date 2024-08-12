const asyncwrapper = require('../middleware/asyncwrapper');
const User = require('../models/users.model');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

const getAllUsers = asyncwrapper(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        results: users.length,
        data: {
            users
        }
    });
});

const getSingleUser = asyncwrapper(async (req, res, next) => {
    
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
        const error = appError.create('this user is not found', 404, httpStatusText.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user
        }
    });
})

const updateUser = asyncwrapper(async (req, res, next) => {
    
    const userId = req.params.userId;

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: { ...req.body } });

    if (!updatedUser) {
        const error = appError.create('this user is not found to update', 404, httpStatusText.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            updatedUser
        }
    });
});

const deleteUser = asyncwrapper(async (req, res, next) => {

    const userId = req.params.userId;

    await User.deleteOne({ _id: userId });

    res.status(204).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});

module.exports = {
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser
}