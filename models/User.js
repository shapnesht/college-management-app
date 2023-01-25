const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: [3, "Name can't be less than 3 characters"],
    maxlength: [50, "Name can't be more than 50 characters"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  // if (!this.isModified("passsword")) return;
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePasswords = async function (givenPassword) {
  const matches = await bcrypt.compare(givenPassword, this.password);
  return matches;
};

module.exports = mongoose.model("User", UserSchema);
