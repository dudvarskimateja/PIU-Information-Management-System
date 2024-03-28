require('dotenv').config({ path: './config/config.env' })
const { sendEmail } = require('./config/nodemailer')

const testEmailOptions = {
  to: "matejadudvarski@gmail.com", // Replace with your actual recipient email
  subject: "Test Email from NodeMailer",
  text: "This is a test email sent using NodeMailer with OAuth2.",
  html: "<b>This is a test email sent using NodeMailer with OAuth2.</b>"
};

(async () => {
  try {
    await sendEmail(testEmailOptions);
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
})();