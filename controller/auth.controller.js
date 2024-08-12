const crypto = require('crypto');
const asyncwrapper = require('../middleware/asyncwrapper');
const User = require('../models/users.model');
const appError = require('../utils/appError');
const httpStatusText = require("../utils/httpStatusText");
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');



const generateJWT = id => {
    return jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


const signUp = asyncwrapper(async (req, res, next) => {
    
    const newUser = await User.create(req.body);

    const token = generateJWT(newUser._id);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        token,
        data: {
            newUser
        }
    });
});

const login = asyncwrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const error = appError.create('please insert both your password and email', 400, httpStatusText.FAIL);
        return next(error);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        const error = appError.create('email or password may be wrong', 401, httpStatusText.FAIL);
        return next(error);
    }

    const token = generateJWT(user._id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            token
        }
    });
});

const forgetPassword = asyncwrapper(async (req, res, next) => {
    
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        const error = appError.create("this email not found", 404, httpStatusText.FAIL);
        return next(error);
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // send email to user

    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;

    const message = `Forget your password ? submit a patch request with your new password and passwordConfirm to :${resetUrl}.\n if you didn't forget your password , please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: `your password reset token (valid for 10 min)`,
            message
        });

        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {
                message: "token send to email",
            }
        });

    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        const error = appError.create("something wrong , try again later", 500, httpStatusText.FAIL);
        return next(error);
    }
});

const resetPassword = asyncwrapper(async (req, res, next) => {
    
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        const error = appError.create('invalid token || token is expired', 400, httpStatusText.FAIL);
        return next(error);
    };

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = generateJWT(user._id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            token
        }
    });
});

const updatePassword = asyncwrapper(async (req, res, next) => {
    
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        const error = appError.create('your current password is wrong ! ', 401, httpStatusText.FAIL);
        return next(error);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    const token = generateJWT(user._id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            token
        },
        message: "password is changed successfully"
    });
});

const signOut = asyncwrapper(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
})

module.exports = {
    signUp,
    login,
    forgetPassword,
    resetPassword,
    updatePassword,
    signOut
};