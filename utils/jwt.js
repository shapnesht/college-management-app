const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = (res, { payload }) => {
  const token = createJWT({ payload });
  //   30 days = 1000 ms = 1s
  const oneday = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneday),
    signed: true,
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };
