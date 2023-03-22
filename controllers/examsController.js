const { getExamModel } = require("../model/Exam");
const { getTaskModel } = require("../model/Task");
const { getCourseModel } = require("../model/Course");
const { getTopicModel } = require("../model/Topic");

const getAllExams = async (req, res) => {
  const Exam = getExamModel();
  const Course = getCourseModel();

  const createdBy = req.query.createdBy;

  const exams = await Exam.find({ createdBy: createdBy }).lean();

  if (!exams?.length) {
    return res.status(400).json({ message: "No exams found" });
  }

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

  const examBlocks = [];
  let examDuration = 0;
  let examPoints = 0;

  for (let i = 0; i < blocks.length; i++) {
    const { blockName, blockDuration, topic } = blocks[i];
    let blockPoints = 0;
    let blockDurationSum = 0;
    const blockTasks = [];

    const courseObj = await Course.findOne({ _id: course });
    const topicObj = await Topic.findOne({ _id: topic });
    const allTasks = await Task.find({
      course: courseObj._id,
      topic: topicObj._id,
    });

    const totalTaskDuration = allTasks.reduce(
      (sum, task) => sum + task.duration,
      0
    );
    if (totalTaskDuration < blockDuration) {
      return res
        .status(400)
        .json({
          message: `Not enough tasks available for block '${blockName}'`,
        });
    }

    while (blockDurationSum < blockDuration) {
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

  if (!_id) {
    return res.status(400).json({ message: "Exam ID required" });
  }

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
