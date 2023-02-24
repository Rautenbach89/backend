const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

function getTopicModel() {
  return mongoose.model("Topic", topicSchema);
}

module.exports = {
  getTopicModel,
};
