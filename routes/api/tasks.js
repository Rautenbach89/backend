const express = require("express");
const router = express.Router();
const tasksController = require("../../controllers/tasksController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");
router
  .route("/")
  .get(tasksController.getAllTasks)
  .post(tasksController.createNewTask);

router.route("/show/:id").get(tasksController.getTaskWithRefs);

router
  .route("/:id")
  .get(tasksController.getTask)
  .put(tasksController.updateTask)
  .delete(tasksController.deleteTask);

module.exports = router;
