const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const OUTPUT_DIR = path.join(__dirname, "outputs");

const envVars = process.env;
// Get all generated invoice files
const files = fs
  .readdirSync(OUTPUT_DIR)
  .filter((file) => file.endsWith(".xlsx"))
  .map((file) => path.join(OUTPUT_DIR, file));

async function sendBillingEmails(files) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const attachments = files.map((file) => ({
    filename: file,
    path: path.join("output", file),
  }));

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: "Monthly Invoice Sheets",
    text: "Attached are the invoice sheets for this month.",
    attachments,
    // cc
  };

  await transporter.sendMail(mailOptions);
  console.log("Emails sent successfully.");
}

module.exports = { sendBillingEmails };
