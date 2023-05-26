const CustomAPIError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticationHandler = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomAPIError.UnauthenticatedError("Authentication invalid");
  }
  try {
    const { name, userId, role } = isTokenValid(token);
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomAPIError.UnauthenticatedError("Authentication invalid");
  }
};

const authorizeUser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomAPIError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticationHandler, authorizeUser };
