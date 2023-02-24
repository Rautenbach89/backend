const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/:id")
  .get(usersController.showUser)
  .put(usersController.updateUser);

router
  .route("/")
  .get(usersController.showAllUsers)
  .delete(usersController.deleteUser)
  .put(usersController.changeLanguage);

module.exports = router;
