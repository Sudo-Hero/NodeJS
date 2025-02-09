const User = require("../Models/User");
const CustomError = require("../Utils/CustomError");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.getAllUsers = AsyncErrorHandler(async (req, res, next) => {
    let users = await User.find({status: {$ne: false}});
    
    res.status(200).json({
        status: "success",
        length: users.length,
        users
    })
})

exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
    let currentPassword = req.body.currentPassword;
    let hashedCurrentPassword = await bcrypt.hash(currentPassword, 12);
    let user = req.user;
    let isCorrectPassword = await user.comparePassword(currentPassword);
    if (!isCorrectPassword) {
        let err = new CustomError("Given current password is wrong!", 400);
        return next(err);
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Math.floor(Date.now() / 1000);

    await user.save();

    let token = jwt.sign({ id: user._id }, privateKey, {
        algorithm: "RS256",
        expiresIn: process.env.LOGIN_EXP,
    })
    console.log(token);
    res.status(200).json({
        status: "success",
        token
    })
})


exports.updateUser = AsyncErrorHandler(async (req, res, next) => {
    if (!req.body.name && !req.body.email) {
        let err = new CustomError("Please specify one of the fields to update", 400);
        return next(err);
    }

    let update = {
        name: req.body.name || req.user.name,
        email: req.body.email || req.user.email,
    }

    let user = await User.findByIdAndUpdate({ _id: req.user._id }, update, { new: true });

    res.status(200).json({
        status: "success",
        data: user,
    })
})

exports.deleteUser = AsyncErrorHandler(async (req, res, next) => {
    req.user.active = false;

    let user = await req.user.save({validateBeforeSave: false});
    if(!user){
        console.log("not updated")
    }
    res.status(200).json({
        status: "success",
        message: "User Deleted!"
    })
})