const express = require("express");
const authController = require("./../Controllers/authController");
const userController = require("./../Controllers/userController");

let router = express.Router();

router.route("/updateUser").patch(authController.authorize, userController.updateUser);
router.route("/updatePassword").patch(authController.authorize, userController.updatePassword);

module.exports = router;