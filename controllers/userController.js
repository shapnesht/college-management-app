const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermission,
} = require("../utils");
const Token = require("../models/Token");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new CustomAPIError.NotFoundError(`Given id: ${id} doesn't exist`);
  }
  checkPermission(req.user, user._id);
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
  const existingToken = await Token.findOne({ user: payload.user_id });

  let refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: payload._id };

  await Token.findOneAndUpdate({ _id: existingToken._id }, { userToken });
  attachCookiesToResponse({ res, user: payload, refreshToken });
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
  updateUserPassword,
};
