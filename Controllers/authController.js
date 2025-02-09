const User = require("../Models/User");
const fs = require("fs");
const util = require('util')
const CustomError = require("../Utils/CustomError");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const jwt = require("jsonwebtoken");
const privateKey = fs.readFileSync("private.pem", "utf-8");
const publicKey = fs.readFileSync("public.pem", "utf-8")
const mailer = require("../Utils/Mailer")
const crypto = require("crypto")
const bcrypt = require("bcrypt")


exports.signup = AsyncErrorHandler(async (req, res, next) => {
    let newUser = await User.create(req.body);

    if (!newUser) {
        let err = new CustomError("Unable to create user!", 400);
        return next(err);
    }
    let token = jwt.sign({ id: newUser._id }, privateKey, {
        algorithm: "RS256",
        expiresIn: process.env.LOGIN_EXP,
    })

    res.status(200).json({
        newUser,
        token,
    })
})

exports.signin = AsyncErrorHandler(async (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        let err = new CustomError("Please enter email & password!", 400)
        return next(err);
    }

    let user = await User.findOne({ email: req.body.email , active: {$ne: false}});
    if (!user) {
        let err = new CustomError("User not found!", 400)
        return next(err);
    }
    let isCorrectPassword = await user.comparePassword(password)
    if (!isCorrectPassword) {
        let err = new CustomError("Invalid Credentials!", 400)
        return next(err);
    }

    let token = jwt.sign({ id: user._id }, privateKey, {
        algorithm: "RS256",
        expiresIn: process.env.LOGIN_EXP,
    })
    res.status(200).json({
        status: "success",
        token
    })
})

exports.authorize = AsyncErrorHandler(async (req, res, next) => {
    //1. Check if the token exists
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer")) {
        token = token.split(" ")[1];
    }
    if (!token) {
        let err = new CustomError("Unauthorised access!", 403);
        next(err);
    }
    //2. Validate token
    let decodedToken = await util.promisify(jwt.verify)(token, publicKey, { algorithm: "RS256" });
    //3. check if user exists
    let user = await User.findOne({_id: decodedToken.id, active: {$ne: false}});
    console.log(user.email, user.active)
    if (!user) {
        let err = new CustomError("The user does not exist!", 400);
        return next(err)
    }
    if (user.isPasswordChanged(decodedToken.iat)) {
        let err = new CustomError("The password was changed please re-login");
        next(err);
    }
    req.user = user;
    next();
})

exports.restrict = (req, res, next) => {
    if (!req.user.role.includes("admin")) {
        return next(new CustomError("Unauthorised action!", 403));
    }
    next();
}

exports.forgotPassword = AsyncErrorHandler(async (req, res, next) => {
    if (!req.body.email) {
        return next(new CustomError("Please provide an email!", 400));
    }

    let email = req.body.email;
    let user = await User.findOne({ email });

    if (!user) {
        return next(new CustomError("User not found!", 404));
    }
    let resetToken = user.createPasswordResetToken();
    console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    let resetUrl = `${req.protocol}://${req.get("host")}/api/v1/user/resetPassword/${resetToken}`
    let opt = {
        email: user.email,
        subject: "Password reset for Cineflix",
        message: `Please use the link below to reset you password \n\n${resetUrl}\n\nThe above link will expire in 10 minutes.`
    }

    try {
        await mailer(opt);
        res.status(200).json({
            status: "success",
            message: "You will receive email with link to reset your password.",
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresAt = undefined;
        await user.save({ validateBeforeSave: false });
        next(new CustomError("Something went wrong. Please try again later!", 500));
        // next(err)
    }
})

exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
    let token = req.params.token;
    let hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    let user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExpiresAt: { $gt: Math.floor(Date.now() / 1000) } })
    if (!user) {
        let err = new CustomError("Invalid token or the token has already expired!");
        return next(err);
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    user.passwordChangedAt = Math.floor(Date.now() / 1000)

    await user.save();
    let loginToken = jwt.sign({ id: user._id }, privateKey, {
        algorithm: "RS256",
        expiresIn: process.env.LOGIN_EXP,
    })

    res.status(200).json({
        status: "success",
        token: loginToken,
    })
})