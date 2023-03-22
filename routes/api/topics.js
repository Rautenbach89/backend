const express = require("express");
const router = express.Router();
const topicsController = require("../../controllers/topicsController");
const ROLES_LIST = require("../../config/roles_list");

router
  .route("/")
  .get(topicsController.getAllTopics)
  .post(topicsController.createNewTopic);

router
  .route("/:id")
  .put(topicsController.updateTopic)
  .get(topicsController.getTopic)
  .delete(topicsController.deleteTopic);

module.exports = router;
