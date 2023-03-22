const { getCourseModel } = require("../model/Course");
const { getTopicModel } = require("../model/Topic");
const { getTaskModel } = require("../model/Task");


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

  const existingCourse = await Course.findOne({ title: req.body.title }).exec();
  if (existingCourse) {
    return res
      .status(409)
      .json({ message: "A course with the same title already exists." });
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

  if (req.body?.title && req.body.title !== course.title) {
    const existingCourse = await Course.findOne({ title: req.body.title }).exec();
    if (existingCourse) {
      return res
        .status(409)
        .json({ message: `A course with the title ${req.body.title} already exists.` });
    }
    course.title = req.body.title;
  }

  if (req.body?.description) course.description = req.body.description;
  const result = await course.save();
  res.json(result);
};

const deleteCourse = async (req, res) => {
  const Course = getCourseModel();
  const Topic = getTopicModel();
  const Task = getTaskModel();

  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ message: "Course ID required" });
  }

  const course = await Course.findById(_id).exec();
  if (!course) {
    return res.status(400).json({ message: "Course not found" });
  }

  const topics = await Topic.find({ course: _id }).exec();
  const tasks = await Task.find({ course: _id }).exec();
  if (topics.length > 0 || tasks.length > 0) {
    return res.status(420).json({ message: "Cannot delete course with associated topics or tasks" });
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
