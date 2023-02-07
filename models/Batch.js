const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    branch: {
      type: String,
      enum: ["IT", "EC", "EE", "ME", "CE"],
      required: true,
    },
    teacher: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    students: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    noOfStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", BatchSchema);
