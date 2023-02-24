const express = require("express");
const router = express.Router();
const examsController = require("../../controllers/examsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(examsController.getAllExams)
  .post(examsController.createExam);

router
  .route("/:id")
  .delete(examsController.deleteExam)
  .get(examsController.getExamWithRefs);

module.exports = router;
