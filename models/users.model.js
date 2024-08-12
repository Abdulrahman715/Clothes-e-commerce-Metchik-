const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const userRoles = require('../utils/userRoles');

const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please tell us your name !'],
    },
    email: {
        type: String,
        required: [true, 'please provide your email !'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email'],
    },
    photo: {
        type: String,
        default: "https://res.cloudinary.com/duwfy7ale/image/upload/v1714772509/gbktjsj2ynk4j1xxtk8x.jpg"
    },
    role: {
        type: String,
        enum: [userRoles.USER, userRoles.ADMIN, userRoles.MANAGER],
        default: userRoles.USER
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minLength: 8,
        validate: {
            validator: function (value) {
                return /[0-9]/.test(value) && /[@#$%^&*(){}!~?><]/.test(value)
            },
            message: "password must contain at least one special number and one special character"
        },
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return value === this.password;
            },
            message: "Passwords not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

// Remove `confirmPassword` field before saving to the database
userSchema.pre('save',async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password'))
    {
        return next();
    }

    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    

    //Delete password confirm field
    this.confirmPassword = undefined;
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {

    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }


    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // encrypt resetToken

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;

};

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    
    this.find({ active: { $ne: false } });
    next();
});

module.exports = mongoose.model("User", userSchema);