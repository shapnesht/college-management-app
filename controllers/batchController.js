const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const Batch = require("../models/Batch");
const User = require("../models/User");
const { checkPermissions } = require("../utils");

const createBatch = async (req, res) => {
  let { year, branch, subject, students } = req.body;
  if (!branch || !subject) {
    throw new CustomAPIError.BadRequestError(
      "Please provide branch name and subject name."
    );
  }
  if (!students || students?.length == 0) {
    throw new CustomAPIError.BadRequestError("Please add atleast one student");
  }
  if (!year) year = new Date().getFullYear();
  const teacher = req.user.userId;
  const noOfStudents = students.length;
  for (const student of students) {
    const user = await User.findOne({ _id: student });
    if (!user) {
      throw new CustomAPIError.NotFoundError(
        `please provide the valid id of students`
      );
    }
  }
  const batch = await Batch.create({
    year,
    branch,
    subject,
    teacher,
    students,
    noOfStudents,
  });
  await User.updateMany(
    { _id: students },
    { $push: { subjects: batch._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await User.findOneAndUpdate(
    { _id: teacher },
    { $push: { subjects: batch._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.ACCEPTED).json({ batch });
};

const updateBatch = async (req, res) => {
  const { year, branch, subject } = req.body;
  const { id } = req.params;
  if (!branch || !subject || !year) {
    throw new CustomAPIError.BadRequestError(
      "Please provide branch the year, branch and subject name."
    );
  }
  let batch = await Batch.findOne({ _id: id });
  if (!batch) {
    throw new CustomAPIError.NotFoundError(`Batch not found with id: ${id}`);
  }
  checkPermissions(req.user, batch.teacher);
  batch = await Batch.findByIdAndUpdate(
    { _id: id },
    { year, branch, subject },
    { runValidators: true, new: true }
  );
  res.status(StatusCodes.OK).json({ batch });
};

const updateStudentsOfBatch = async (req, res) => {
  const { students: newStudents } = req.body;
  const { id } = req.params;
  if (!newStudents || newStudents?.length == 0) {
    throw new CustomAPIError.BadRequestError("Please add atleast one student");
  }
  for (const student of newStudents) {
    const user = await User.findOne({ _id: student });
    if (!user) {
      throw new CustomAPIError.NotFoundError(
        `please provide the valid id of students`
      );
    }
  }
  let batch = await Batch.findOne({ _id: id });
  if (!batch) {
    throw new CustomAPIError.NotFoundError(`Batch not found with id: ${id}`);
  }
  checkPermissions(req.user, batch.teacher);
  const oldStudents = batch.students.map((str) => str.toString());
  batch = await Batch.findOneAndUpdate(
    { _id: id },
    { students: newStudents, noOfStudents: newStudents.length },
    { runValidators: true, new: true }
  );
  console.log(oldStudents);
  console.log(newStudents);
  const added = difference(newStudents, oldStudents);
  const removed = difference(oldStudents, newStudents);
  await User.updateMany({ _id: added }, { $addToSet: { subjects: id } });
  await User.updateMany({ _id: removed }, { $pull: { subjects: id } });
  res.status(StatusCodes.OK).json({ batch });
};

function difference(A, B) {
  const arrA = Array.isArray(A) ? A.map((x) => x.toString()) : [A.toString()];
  const arrB = Array.isArray(B) ? B.map((x) => x.toString()) : [B.toString()];

  const result = [];
  for (const p of arrA) {
    if (arrB.indexOf(p) === -1) {
      result.push(p);
    }
  }

  return result;
}

const deleteBatch = async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findOne({ _id: id });
  if (!batch) {
    throw new CustomAPIError.NotFoundError(`Batch not found with id: ${id}`);
  }
  console.log(batch._id);
  checkPermissions(req.user, batch.teacher);
  await batch.remove();
  await User.updateMany(
    { _id: batch.students },
    { $pull: { subjects: batch._id.toString() } }
  );
  await User.findOneAndUpdate(
    { _id: req.user.userId },
    { $pull: { subjects: batch._id.toString() } }
  );
  res.status(StatusCodes.OK).json({ msg: `Successfully deleted the batch` });
};

const getBatch = async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findOne({ _id: id, teacher: req.user.userId });
  if (!batch) {
    throw new CustomAPIError.NotFoundError(`Batch not found with id: ${id}`);
  }
  res.status(StatusCodes.OK).json(batch);
};

const getAllBatches = async (req, res) => {
  const batches = await Batch.find({});
  res.status(StatusCodes.OK).json(batches);
};

module.exports = {
  createBatch,
  updateBatch,
  deleteBatch,
  getBatch,
  getAllBatches,
  updateStudentsOfBatch,
};
