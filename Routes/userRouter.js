const express = require("express");
const authController = require("./../Controllers/authController");
const userController = require("./../Controllers/userController");

let router = express.Router();

router.route("/getAllUsers").get(userController.getAllUsers);
router.route("/updateUser").patch(authController.authorize, userController.updateUser);
router.route("/updatePassword").patch(authController.authorize, userController.updatePassword);
router.route("/deleteUser").delete(authController.authorize, userController.deleteUser);

module.exports = router;