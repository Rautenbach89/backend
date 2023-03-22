const { getCourseModel } = require("../model/Course");
const { getTopicModel } = require("../model/Topic");
const { getTaskModel } = require("../model/Task");



const getAllTopics = async (req, res) => {
  const Topic = getTopicModel();
  const Course = getCourseModel();

  const topics = await Topic.find().lean();

  if (!topics?.length) {
    return res.status(400).json({ message: "No topics found" });
  }


  const topicsWithRef = await Promise.all(
    topics.map(async (topic) => {
      const course = await Course.findById(topic.course).lean().exec();
      return { ...topic, course: course.title };
    })
  );

  res.json(topicsWithRef);
};

const createNewTopic = async (req, res) => {
  const Topic = getTopicModel();
  const Course = getCourseModel();

  const { title, description, course } = req.body;

  if (!title || !description || !course) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const courseObj = await Course.findOne({ _id: course }).exec();
  const existingTopic = await Topic.findOne({
    title,
    course: courseObj._id
  }).exec();

  if (existingTopic) {
    return res
      .status(409)
      .json({ error: "Duplicate topic title. Please use a different title." });
  }

  const newTopic = new Topic({
    title,
    description,
    course: courseObj._id,
  });

  const result = await newTopic.save();
  res.json(result);
};

const updateTopic = async (req, res) => {
  const Topic = getTopicModel();
  const Course = getCourseModel();

  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const topic = await Topic.findOne({ _id: req.body.id }).exec();
  if (!topic) {
    return res
      .status(204)
      .json({ message: `No topic matches ID ${req.body.id}.` });
  }

  if (req.body?.title) {
    const course = await Course.findOne({ _id: topic.course }).exec();
    const existingTopic = await Topic.findOne({
      title: req.body.title,
      course: course._id,
      _id: { $ne: topic._id },
    }).exec();
    if (existingTopic) {
      return res
        .status(409)
        .json({ message: `A topic with title ${req.body.title} already exists in the same course.` });
    }
    topic.title = req.body.title;
  }
  
  if (req.body?.description) topic.description = req.body.description;
  if (req.body?.course) topic.course = req.body.course;

  const result = await topic.save();
  res.json(result);
};

const deleteTopic = async (req, res) => {
  const Topic = getTopicModel();
  const Task = getTaskModel();

  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ message: "Topic ID required" });
  }

  const topic = await Topic.findById(_id).exec();

  if (!topic) {
    return res.status(400).json({ message: "Topic not found" });
  }

  const tasksUsingTopic = await Task.findOne({ topic: _id });

  if (tasksUsingTopic) {
    return res.status(420).json({ message: "Tasks are using this topic. Please delete those tasks first." });
  }

  const result = await topic.deleteOne();

  const reply = `Topic '${result.topicName}' with ID ${result._id} deleted`;

  res.json(reply);
};

const getTopic = async (req, res) => {
  const Topic = getTopicModel();

  if (!req?.params?.id)
    return res.status(400).json({ message: "Topic ID required." });

  const topic = await Topic.findOne({ _id: req.params.id }).exec();
  if (!topic) {
    return res
      .status(204)
      .json({ message: `No topic matches ID ${req.params.id}.` });
  }
  res.json(topic);
};

module.exports = {
  getAllTopics,
  createNewTopic,
  updateTopic,
  deleteTopic,
  getTopic,
};
