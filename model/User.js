const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Author: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: "en",
  },
  active: {
    type: Boolean,
    default: true,
  },
  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
