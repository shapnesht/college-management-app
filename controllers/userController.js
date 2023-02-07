const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const {
  createTokenUser,
  attachCookieToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new CustomAPIError.NotFoundError(`Given id: ${id} doesn't exist`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    throw new CustomAPIError.BadRequestError("Please provide name and email");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    {
      new: true,
      runValidators: true,
    }
  );
  const payload = createTokenUser(user);

  attachCookieToResponse({ res, user: payload });
  res.status(StatusCodes.OK).json({ user: payload });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomAPIError.BadRequestError(
      "Please provide new password and old password"
    );
  }
  const user = await User.findOne({ _id: req.user.userId });
  const matches = await user.comparePasswords(oldPassword);
  if (!matches) {
    throw new CustomAPIError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "Success password updated successfully!!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
};
