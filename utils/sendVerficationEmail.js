const sendEmail = require("../utils/sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const url = `${origin}/auth/verify-email?email=${email}&token=${verificationToken}`;

  const msg = `<p>Please confirm your email by clicking on following link: <a href = "${url}">Verify Email</a>`;

  return sendEmail({
    to: email,
    subject: "Verification Mail",
    html: `<h4>Hello ${name}</h4>${msg}`,
  });
};

module.exports = sendVerificationEmail;
