const sendEmail = require("../utils/sendEmail");

const sendResetPasswordEmail = async ({
  email,
  passwordToken,
  origin,
  name,
}) => {
  const url = `${origin}/user/reset-password/?email=${email}&token=${passwordToken}`;

  const message = `<h1>Hello ${name}</h1><p>This is the link to reset your password and it will expire in 24 hours</p><a href="${url}">Click Here to change password</a>`;

  return sendEmail({ to: email, subject: "Reset Password", html: message });
};

module.exports = sendResetPasswordEmail;
