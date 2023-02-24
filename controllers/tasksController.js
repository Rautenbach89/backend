const { getCourseModel } = require("../model/course");
const { getTopicModel } = require("../model/topic");
const User = require("../model/User");
const { getTaskModel } = require("../model/task");

// @desc Get all tasks
// @route GET /tasks
// @access Private
const getAllTasks = async (req, res) => {
  const Task = getTaskModel();
  const Topic = getTopicModel();
  const Course = getCourseModel();

  // Get all tasks from MongoDB
  const tasks = await Task.find().lean();

  // If no tasks
  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  // Add topic and course name to each task before sending the response
  // You could also do this with a for...of loop
  const tasksWithRefs = await Promise.all(
    tasks.map(async (task) => {
      const topic = await Topic.findById(task.topic).lean().exec();
      const course = await Course.findById(task.course).lean().exec();
      return { ...task, course: course?.title, topic: topic?.title };
    })
  );

  res.json(tasksWithRefs);
};

// @desc Create new task
// @route POST /tasks
// @access Private
const createNewTask = async (req, res) => {
  const Task = getTaskModel();
  const Course = getCourseModel();
  const Topic = getTopicModel();

  const {
    title,
    description,
    course,
    topic,
    tasktype,
    duration,
    difficulty,
    points,
    question,
    answers,
    user,
  } = req.body;
  console.log(req.body);
  // Confirm data
  if (
    !title ||
    !description ||
    !course ||
    !topic ||
    !tasktype ||
    !duration ||
    !difficulty ||
    !points ||
    !question ||
    (answers && answers.length > 0 && answers[0].answer === undefined) ||
    !user
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if duration, difficulty, and points are numbers
  if (isNaN(duration) || isNaN(difficulty) || isNaN(points)) {
    return res
      .status(400)
      .json({ message: "Duration, difficulty, and points must be numbers" });
  }

  // Check if difficulty is between 1 and 5
  if (difficulty < 1 || difficulty > 5) {
    return res
      .status(400)
      .json({ message: "Difficulty must be a number between 1 and 5" });
  }

  // Check if course and topic exist in database
  const courseExists = await Course.findById(course);
  if (!courseExists) {
    return res.status(400).json({ message: "Course does not exist" });
  }

  const topicExists = await Topic.findById(topic);
  if (!topicExists) {
    return res.status(400).json({ message: "Topic does not exist" });
  }

  // Create and store the new task
  const task = await Task.create({
    title,
    description,
    course,
    topic,
    tasktype,
    duration,
    difficulty,
    points,
    question,
    answers,
    createdBy: user,
  });

  if (task) {
    // Created
    return res.status(200).json({ message: "New task created" });
  } else {
    return res.status(400).json({ message: "Invalid task data received" });
  }
};

// @desc Update a task
// @route PATCH /tasks
// @access Private

const updateTask = async (req, res) => {
  const Task = getTaskModel();

  console.log(req.body.id);
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const task = await Task.findOne({ _id: req.body.id }).exec();
  if (!task) {
    return res
      .status(204)
      .json({ message: `No task matches ID ${req.body.id}.` });
  }
  if (req.body?.title) task.title = req.body.title;
  if (req.body?.description) task.description = req.body.description;
  if (req.body?.course) task.course = req.body.course;
  if (req.body?.topic) task.topic = req.body.topic;
  if (req.body?.tasktype) task.tasktype = req.body.tasktype;
  if (req.body?.duration) task.duration = req.body.duration;
  if (req.body?.difficulty) task.difficulty = req.body.difficulty;
  if (req.body?.points) task.points = req.body.points;
  if (req.body?.question) task.question = req.body.question;
  if (req.body?.answers) task.answers = req.body.answers;

  const result = await task.save();
  res.json(result);
};

// @desc Delete a task
// @route DELETE /tasks
// @access Private
const deleteTask = async (req, res) => {
  const Task = getTaskModel();

  const { _id } = req.body;

  // Confirm data
  if (!_id) {
    return res.status(400).json({ message: "Task ID required" });
  }

  // Confirm note exists to delete
  const task = await Task.findById(_id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  const result = await task.deleteOne();

  const reply = `Task '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

const getTask = async (req, res) => {
  const Task = getTaskModel();

  if (!req?.params?.id)
    return res.status(400).json({ message: "Task ID required." });

  const task = await Task.findOne({ _id: req.params.id }).lean().exec();
  if (!task) {
    return res
      .status(204)
      .json({ message: `No task matches ID ${req.params.id}.` });
  }

  res.json(task);
};

const getTaskWithRefs = async (req, res) => {
  const Task = getTaskModel();
  const Course = getCourseModel();
  const Topic = getTopicModel();

  if (!req?.params?.id)
    return res.status(400).json({ message: "Task ID required." });

  const task = await Task.findOne({ _id: req.params.id }).lean().exec();
  if (!task) {
    return res
      .status(204)
      .json({ message: `No task matches ID ${req.params.id}.` });
  }

  const topic = await Topic.findById(task?.topic).lean().exec();
  const course = await Course.findById(task?.course).lean().exec();
  const taskWithRefs = { ...task, course: course?.title, topic: topic?.title };

  res.json(taskWithRefs);
};

module.exports = {
  getAllTasks,
  createNewTask,
  updateTask,
  deleteTask,
  getTask,
  getTaskWithRefs,
};
