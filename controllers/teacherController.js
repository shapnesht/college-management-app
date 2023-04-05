const User = require("../models/User");
const Batch = require("../models/Batch");
const { StatusCodes } = require("http-status-codes");

const getAllTeachers = async (req, res) => {
  const teachers = await User.find({ role: "teacher" }).select("-password");
  res.status(StatusCodes.OK).json({ teachers });
};

const getAllBatchesOfTeacher = async (req, res) => {
  const batches = await Batch.find({ teacher: req.user.userId }).select(
    "subject noOfStudents"
  );
  res.status(StatusCodes.OK).json({ batches });
};

module.exports = {
  getAllTeachers,
  getAllBatchesOfTeacher,
};
