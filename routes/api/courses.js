const express = require("express");
const router = express.Router();
const coursesController = require("../../controllers/coursesController");
const ROLES_LIST = require("../../config/roles_list");

router
  .route("/")
  .get(coursesController.getAllCourses)
  .post(coursesController.createNewCourse);

router.route("/:id/topics").get(coursesController.getTopicsByCourse);

router
  .route("/:id")
  .put(coursesController.updateCourse)
  .delete(coursesController.deleteCourse)
  .get(coursesController.getCourse);

module.exports = router;
