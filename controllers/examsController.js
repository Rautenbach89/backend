const { getExamModel } = require("../model/exam");
const { getTaskModel } = require("../model/task");
const { getCourseModel } = require("../model/course");
const { getTopicModel } = require("../model/topic");

const getAllExams = async (req, res) => {
  const Exam = getExamModel();
  const Course = getCourseModel();

  const createdBy = req.query.createdBy;

  // Get all tasks from MongoDB
  const exams = await Exam.find({ createdBy: createdBy }).lean();

  // If no tasks
  if (!exams?.length) {
    return res.status(400).json({ message: "No exams found" });
  }

  // Add topic and course name to each task before sending the response
  // You could also do this with a for...of loop
  const examsWithRef = await Promise.all(
    exams.map(async (exam) => {
      const course = await Course.findById(exam.course).lean().exec();
      return { ...exam, course: course?.title };
    })
  );

  res.json(examsWithRef);
};

const createExam = async (req, res) => {
  const Exam = getExamModel();
  const Task = getTaskModel();
  const Course = getCourseModel();
  const Topic = getTopicModel();

  const { title, course, createdBy, notes, blocks } = req.body;

  // Find tasks for each block
  const examBlocks = [];
  let examDuration = 0;
  let examPoints = 0;

  for (let i = 0; i < blocks.length; i++) {
    const { blockName, blockDuration, topic } = blocks[i];
    let blockPoints = 0;
    let blockDurationSum = 0;
    const blockTasks = [];

    while (blockDurationSum < blockDuration) {
      const courseObj = await Course.findOne({ _id: course });
      const topicObj = await Topic.findOne({ _id: topic });

      const tasks = await Task.aggregate([
        {
          $match: {
            course: courseObj._id,
            topic: topicObj._id,
            _id: { $nin: blockTasks },
          },
        },
        { $sample: { size: 1 } },
      ]);

      const task = tasks[0];
      if (!task) {
        break;
      }

      const taskDuration = task.duration;
      if (blockDurationSum + taskDuration > blockDuration) {
        continue;
      }

      blockPoints += task.points;
      blockDurationSum += taskDuration;
      blockTasks.push(task);
    }

    examDuration += blockDurationSum;
    examPoints += blockPoints;
    examBlocks.push({
      blockName,
      blockDuration: blockDurationSum,
      blockPoints,
      blockTasks,
    });
  }

  // Create exam document and save to database
  const exam = new Exam({
    title,
    course,
    createdBy,
    notes,
    blocks: examBlocks,
    examDuration,
    examPoints,
  });
  await exam.save();

  res.status(201).json({ message: "Exam created successfully", exam });
};

const deleteExam = async (req, res) => {
  const Exam = getExamModel();

  const { _id } = req.body;

  // Confirm data
  if (!_id) {
    return res.status(400).json({ message: "Exam ID required" });
  }

  // Confirm note exists to delete
  const exam = await Exam.findById(_id).exec();

  if (!exam) {
    return res.status(400).json({ message: "Exam not found" });
  }

  const result = await exam.deleteOne();

  const reply = `Exam '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

const getExamWithRefs = async (req, res) => {
  const Task = getTaskModel();
  const Course = getCourseModel();
  const Exam = getExamModel();

  if (!req?.params?.id)
    return res.status(400).json({ message: "Exam ID required." });

  const exam = await Exam.findOne({ _id: req.params.id }).lean().exec();
  if (!exam) {
    return res
      .status(204)
      .json({ message: `No exam matches ID ${req.params.id}.` });
  }

  const course = await Course.findById(exam?.course).lean().exec();
  const examWithRefs = { ...exam, course: course?.title };
  console.log(examWithRefs);

  res.json(examWithRefs);
};

module.exports = {
  createExam,
  getAllExams,
  deleteExam,
  getExamWithRefs,
};
