const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto")
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required!"],
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "Email field is required!"],
        validate: [validator.isEmail, "Please enter a valid email"],
        unique: true,
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Password field is required!"],
        minlength: 8,
    },
    active:{
        type: Boolean,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirmed Password field is required!"],
        validate: {
            validator: function (val) {
                return this.password === val;
            },
            message: "Password and Confirm Password should be same!",
        }
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetTokenExpiresAt: {
        type: Number,
    },
    passwordChangedAt: {
        type: Number,
        default: Math.floor(Date.now() / 1000),
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordChangedAt = Math.floor(Date.now() / 1000);
    this.confirmPassword = undefined;
})

// userSchema.pre(/^find/, function(next){
//     this.find({active: {$ne: false}});
//     next();
// })

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.isPasswordChanged = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        // console.log(JWTTimestamp , this.passwordChangedAt)
        return JWTTimestamp < this.passwordChangedAt;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    let bytes = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(bytes).digest("hex");
    this.passwordResetTokenExpiresAt = Math.floor(Date.now() / 1000) + (10 * 60);
    return bytes;
}

const User = mongoose.model('User', userSchema);

module.exports = User;