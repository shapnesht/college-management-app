const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html,
  };

  return await sgMail.send(msg);
};

module.exports = sendEmail;
