const nodemailer = require("nodemailer");
const fs = require("fs-extra");
const path = require("path");
const { getCurrentMonth } = require("./utils/utils.js");
require("dotenv").config();

async function sendBillingEmails() {
  // Get all generated invoice files
  const OUTPUT_DIR = path.join(__dirname, "outputs");
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((file) => file.endsWith(".xlsx"))
    .map((file) => path.join(OUTPUT_DIR, file));
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const attachments = files.map((file) => ({
    filename: file.split("/").splice(-1)[0], // Get the file name from the path
    path: file,
  }));
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: `Monthly Invoice Sheets - ${getCurrentMonth()}`,
    text: "Attached are the invoice sheets for this month.",
    attachments,
    cc: process.env.EMAIL_CC || "",
  };

  await transporter.sendMail(mailOptions);
}
module.exports = { sendBillingEmails };
