const mongoose = require("mongoose");

const SingleStudentAttendanceSchema = mongoose.Schema({
  student: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["present", "absent", "holiday", "noclass"],
    default: "noclass",
  },
});

const AttendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  typeOfClass: {
    type: String,
    enum: ["theory", "practical"],
    default: "theory",
  },
  subject: {
    type: mongoose.Types.ObjectId,
    ref: "Batch",
  },
  students: [SingleStudentAttendanceSchema],
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
