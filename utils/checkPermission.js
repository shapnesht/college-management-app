const CustomError = require("../errors");

const checkPermission = (requestUser, resourceId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceId.toString()) return;
  throw new CustomError.UnauthorizedError(
    "Not Authorized to access this route"
  );
};

module.exports = checkPermission;
