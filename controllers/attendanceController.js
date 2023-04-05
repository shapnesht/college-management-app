const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const User = require("../models/User");
const { difference } = require("../utils");
const checkPermission = require("../utils/checkPermission");

const createAttendance = async (req, res) => {
  let { date, time, typeOfClass, subject, students } = req.body;
  if (
    !date ||
    !time ||
    !typeOfClass ||
    !subject ||
    !students ||
    students?.length < 1
  ) {
    throw new CustomAPIError.BadRequestError(
      "Please provide date, time, typeOfClass, subject and student"
    );
  }
  time = new Date(`${date}T${time}`).toLocaleTimeString();
  date = new Date(date).toLocaleDateString();
  // console.log(time);
  const alreadyExists = await Attendance.findOne({ date, time }).populate(
    "subject"
  );
  if (alreadyExists) {
    const teacherName = await User.findOne({
      _id: alreadyExists.subject.teacher,
    });
    throw new CustomAPIError.BadRequestError(
      `Attendance has already been taken on Date: ${date} at time: ${time} by ${teacherName.name}`
    );
  }
  const batch = await Batch.findOne({ _id: subject });
  if (!batch) {
    throw new CustomAPIError.NotFoundError(
      `subject not found with id: ${subject}`
    );
  }
  checkPermission(req.user, batch.teacher);
  const attendance = [];
  const users = [];
  for (const stu of students) {
    const student = await User.findOne({ _id: stu.student, role: "student" });
    if (!student) {
      throw new CustomAPIError.NotFoundError(
        `student not found with id: ${subject}`
      );
    }
    attendance.push({
      student: stu.student,
      status: stu.present === true ? "present" : "absent",
    });
    users.push(stu.student);
  }
  const attendanceSaved = await Attendance.create({
    date,
    time,
    typeOfClass,
    subject,
    students: attendance,
  });
  await User.updateMany(
    { _id: users },
    { $push: { attendances: attendanceSaved._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await User.updateOne(
    { _id: batch.teacher },
    { $push: { attendances: attendanceSaved._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await Batch.updateOne(
    { _id: subject },
    { $push: { attendance: attendanceSaved._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).json({ attendance: attendanceSaved });
};

const deleteAttendance = async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findOne({ _id: id }).populate("subject");
  if (!attendance) {
    throw new CustomAPIError.NotFoundError(
      `attendance not found with id: ${id}`
    );
  }
  const batch = await Batch.findOne({ _id: attendance.subject });
  checkPermission(req.user, batch.teacher);
  const users = [];
  for (const student of attendance.students) {
    users.push(student.student);
  }
  await User.updateMany(
    { _id: users },
    { $pull: { attendances: attendance._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await User.updateOne(
    { _id: req.user.userId },
    { $pull: { attendances: id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await Batch.updateOne(
    { _id: batch._id },
    { $pull: { attendance: id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await attendance.remove();
  res.status(StatusCodes.OK).json({ msg: `Attendance Deleted Successfully` });
};

const getAttendance = async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findOne({ _id: id }).select(
    "date typeOfClass students"
  );
  if (!attendance) {
    throw new CustomAPIError.NotFoundError(
      `attendance not found with id: ${id}`
    );
  }
  res.status(StatusCodes.OK).json(attendance);
};

const updateAttendance = async (req, res) => {
  const { id } = req.params;
  let { date, time, typeOfClass, subject, students } = req.body;
  if (
    !date ||
    !time ||
    !typeOfClass ||
    !subject ||
    !students ||
    students?.length < 1
  ) {
    throw new CustomAPIError.BadRequestError(
      "Please provide date, time, typeOfClass, subject and student"
    );
  }
  time = new Date(`${date}T${time}`).toLocaleTimeString();
  date = new Date(date).toLocaleString();
  let existingAttendance = await Attendance.findOne({ _id: id });
  if (!existingAttendance) {
    throw new CustomAPIError.NotFoundError(
      `Attendance not found with id : ${id}`
    );
  }
  const batch = await Batch.findOne({ _id: subject });
  checkPermission(req.user, batch.teacher);
  const attendance = [];
  const newUsers = [];
  const existingUsers = [];
  for (const stu of students) {
    const student = await User.findOne({ _id: stu.student, role: "student" });
    if (!student) {
      throw new CustomAPIError.NotFoundError(
        `student not found with id: ${subject}`
      );
    }
    attendance.push({
      student: stu.student,
      status: stu.present === true ? "present" : "absent",
    });
    newUsers.push(stu.student);
  }
  for (const stu of existingAttendance.students) {
    existingUsers.push(stu.student);
  }
  const attendanceSaved = await Attendance.findOneAndUpdate(
    { _id: id },
    {
      date,
      time,
      typeOfClass,
      subject,
      students: attendance,
    },
    { new: true, runValidators: true }
  );
  const added = difference(newUsers, existingUsers);
  const removed = difference(existingUsers, newUsers);
  await User.updateMany(
    { _id: added },
    { $push: { attendances: attendanceSaved._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  await User.updateMany(
    { _id: removed },
    { $pull: { attendances: attendanceSaved._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).json({ attendance: attendanceSaved });
};

const getAttendanceByDateAndTime = async (req, res) => {
  let { date, time } = req.body;
  if (!date || !time) {
    throw new CustomAPIError.BadRequestError(
      "Please provide date and time of class"
    );
  }
  date = new Date(date).toLocaleString();
  time = new Date(`${date}T${time}`).toLocaleTimeString();
  const attendance = await Attendance.findOne({ date, time }).select(
    "date typeOfClass students"
  );
  if (!attendance) {
    throw new CustomAPIError.BadRequestError(
      `Attendance has not been taken on ${new Date(
        date
      ).toLocaleDateString()} at time: ${new Date(date).toLocaleTimeString()}`
    );
  }
  res.status(StatusCodes.OK).json({ attendance });
};

const getAllAttendanceByDate = async (req, res) => {
  let { date } = req.body;
  if (!date) {
    throw new CustomAPIError.BadRequestError("Please provide date of class");
  }
  date = new Date(date).toLocaleDateString();
  const attendance = await Attendance.find({ date })
    .select("date time typeOfClass")
    .populate({ path: "subject", match: { teacher: req.user.userId } });
  console.log(attendance);
  if (!attendance || attendance.length == 0) {
    throw new CustomAPIError.BadRequestError(
      `Attendance has not been taken on ${new Date(date)}`
    );
  }
  const attendances = [];
  for (const att of attendance) {
    if (att.subject) attendances.push({ _id: att._id, time: att.time });
  }
  console.log(attendances);
  res
    .status(StatusCodes.OK)
    .json({
      attendances: {
        date: attendances[0].date,
        time: attendance[0].time,
        typeOfClass: attendance[0].typeOfClass,
        subjectName: attendance[0].subject.subject,
      },
    });
};

const getAllAttendance = async (req, res) => {
  const attendance = await Attendance.find({}).select(
    "date typeOfClass students"
  );
  if (!attendance) {
    throw new CustomAPIError.BadRequestError(
      `Attendance has not been taken on ${new Date(date)}`
    );
  }
  res.status(StatusCodes.OK).json({ attendance });
};

module.exports = {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAllAttendanceByDate,
  getAttendance,
  getAttendanceByDateAndTime,
  getAllAttendance,
};
