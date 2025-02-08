const express = require("express")
let authController = require("../Controllers/authController")
let router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/signin").post(authController.signin);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;