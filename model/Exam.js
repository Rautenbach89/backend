const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  notes: [],
  blocks: [
    {
      blockName: {
        type: String,
        required: true,
      },
      blockDuration: {
        type: Number,
        required: true,
      },
      blockPoints: {
        type: Number,
        required: true,
      },
      blockTasks: [
        {
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          tasktype: {
            type: String,
            required: true,
          },
          duration: {
            type: Number,
            required: true,
          },
          difficulty: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          points: {
            type: Number,
            required: true,
          },
          question: {
            type: String,
            required: true,
          },
          answers: [
            {
              answer: {
                type: String,
                required: true,
              },
            },
          ],
        },
      ],
    },
  ],
  examDuration: {
    type: Number,
    required: true,
  },
  examPoints: {
    type: Number,
    required: true,
  },
});

function getExamModel() {
  return mongoose.model("Exam", examSchema);
}

module.exports = {
  getExamModel,
};
