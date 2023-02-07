const { createJWT, isTokenValid, attachCookieToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermission");
const sendVerficationEmail = require("./sendVerficationEmail");
const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const createHash = require("./createHash");

module.exports = {
  createJWT,
  isTokenValid,
  attachCookieToResponse,
  createTokenUser,
  checkPermissions,
  sendVerficationEmail,
  sendResetPasswordEmail,
  createHash,
};
