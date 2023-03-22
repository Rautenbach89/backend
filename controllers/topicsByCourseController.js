const { getCourseModel } = require("../model/Course");
const { getTopicModel } = require("../model/Topic");

const getTopicsByCourse = async (req, res) => {
  const Topic = getTopicModel();

  const { id: courseId } = req.params;
  const topics = await Topic.find({ course: { $eq: courseId } });
  if (!topics) {
    return res
      .status(204)
      .json({ message: "No topics found for this course." });
  }
  console.log(topics);
  res.json(topics);
};

module.exports = {
  getTopicsByCourse,
};
