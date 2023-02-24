const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

function getCourseModel() {
  return mongoose.model("Course", courseSchema);
}

module.exports = {
  getCourseModel,
};
