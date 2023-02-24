const { getCourseModel } = require("../model/course");
const { getTopicModel } = require("../model/topic");

const getAllCourses = async (req, res) => {
  const Course = getCourseModel();

  const courses = await Course.find();
  if (!courses) return res.status(204).json({ message: "No courses found." });
  res.json(courses);
};

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

const createNewCourse = async (req, res) => {
  const Course = getCourseModel();

  if (!req?.body?.title || !req?.body?.description) {
    return res
      .status(400)
      .json({ message: "title and description are required" });
  }

  try {
    const result = await Course.create({
      title: req.body.title,
      description: req.body.description,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

const updateCourse = async (req, res) => {
  const Course = getCourseModel();

  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const course = await Course.findOne({ _id: req.body.id }).exec();
  if (!course) {
    return res
      .status(204)
      .json({ message: `No course matches ID ${req.body.id}.` });
  }
  if (req.body?.title) course.title = req.body.title;
  if (req.body?.description) course.description = req.body.description;
  const result = await course.save();
  res.json(result);
};

const deleteCourse = async (req, res) => {
  const Course = getCourseModel();

  const { _id } = req.body;

  // Confirm data
  if (!_id) {
    return res.status(400).json({ message: "Course ID required" });
  }

  // Confirm note exists to delete
  const course = await Course.findById(_id).exec();

  if (!course) {
    return res.status(400).json({ message: "Course not found" });
  }

  const result = await course.deleteOne();

  const reply = `Course '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

const getCourse = async (req, res) => {
  const Course = getCourseModel();

  if (!req?.params?.id)
    return res.status(400).json({ message: "Course ID required." });

  const course = await Course.findOne({ _id: req.params.id }).exec();
  if (!course) {
    return res
      .status(204)
      .json({ message: `No course matches ID ${req.params.id}.` });
  }
  res.json(course);
};

module.exports = {
  getAllCourses,
  createNewCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  getTopicsByCourse,
};
