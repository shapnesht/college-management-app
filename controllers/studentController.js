const Batch = require("../models/Batch");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const getAllStudentsOfBatch = async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findOne({ _id: id })
    .populate({
      path: "students",
      select: "name",
    })
    .sort("students");
  res.status(StatusCodes.OK).json({ students: batch.students });
};

const getAllSubjectsOfStudent = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "subjects",
    select: "subject",
  });
  res.status(StatusCodes.OK).json({ subjects : user.subjects });
};

const getAllStudents = async (req, res) => {
  const students = await User.find({ role: "student" }).select("-password");
  res.status(StatusCodes.OK).json({ students });
};

module.exports = {
  getAllStudentsOfBatch,
  getAllStudents,
  getAllSubjectsOfStudent,
};
