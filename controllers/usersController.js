const User = require("../model/User");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const showUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  console.log(user.roles);
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};

const showAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.id} not found` });
  }
  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
};

const changeLanguage = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `No user matches ID ${req.body.username}.` });
  }
  if (req.body?.language) user.language = req.body.language;
  const result = await user.save();
  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};

const updateUser = async (req, res) => {
  console.log(req.body);
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `No course matches ID ${req.body.id}.` });
  }
  if (req.body?.roles) user.roles = req.body.roles;
  if (req.body?.active) user.active = req.body.active;
  const result = await user.save();
  console.log(user.roles);
  res.json(result);
};

module.exports = {
  getAllUsers,
  deleteUser,
  changeLanguage,
  getUser,
  showAllUsers,
  showUser,
  updateUser,
};
