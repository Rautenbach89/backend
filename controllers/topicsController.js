const { getCourseModel } = require("../model/course");
const { getTopicModel } = require("../model/topic");

// @desc Get all topics
// @route GET /topics
// @access Private
const getAllTopics = async (req, res) => {
  const Topic = getTopicModel();
  const Course = getCourseModel();

  // Get all topics from MongoDB
  const topics = await Topic.find().lean();

  // If no topics
  if (!topics?.length) {
    return res.status(400).json({ message: "No topics found" });
  }

  // Add topicType name to each topic before sending the response
  // You could also do this with a for...of loop
  const topicsWithRef = await Promise.all(
    topics.map(async (topic) => {
      const course = await Course.findById(topic.course).lean().exec();
      return { ...topic, course: course.title };
    })
  );

  res.json(topicsWithRef);
};

// @desc Create new topic
// @route POST /topics
// @access Private
const createNewTopic = async (req, res) => {
  const Topic = getTopicModel();

  const { title, description, course } = req.body;
  console.log(typeof req.body.course);

  // Confirm data
  if (!title || !description || !course) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Topic.findOne({ title }).lean().exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ error: "Duplicate topic title. Please use a different title." });
  }

  // Create and store the new topic
  try {
    const topic = await Topic.create({ title, description, course });
    if (topic) {
      // Created
      return res.status(200).json({ message: "New topic created" });
    } else {
      return res
        .status(400)
        .json({ error: "Invalid topic data received. Please try again." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to create new topic" });
  }
};

// @desc Update a topic
// @route PATCH /topics
// @access Private
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
  if (req.body?.title) topic.title = req.body.title;
  if (req.body?.description) topic.description = req.body.description;
  if (req.body?.course) topic.course = req.body.course;
  const result = await topic.save();
  res.json(result);
};

// @desc Delete a topic
// @route DELETE /topics
// @access Private
const deleteTopic = async (req, res) => {
  const Topic = getTopicModel();

  const { _id } = req.body;

  // Confirm data
  if (!_id) {
    return res.status(400).json({ message: "Topic ID required" });
  }

  // Confirm note exists to delete
  const topic = await Topic.findById(_id).exec();

  if (!topic) {
    return res.status(400).json({ message: "Topic not found" });
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
