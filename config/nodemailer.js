const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Client ID
  process.env.GOOGLE_CLIENT_SECRET, // Client Secret
  process.env.GOOGLE_REDIRECT_URL, // Redirect URL
);

oAuth2Client.setCredentials({
  refresh_token: 'GOOGLE_REFRESH_TOKEN'
});

async function sendEmail(to, subject, text) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'piumenotifications@gmail.com',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      }
    });

    const mailOptions = {
      from: '"PIUME" <piumenotifications@gmail.com>',
      to: to,
      subject: subject,
      text: text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

module.exports = sendEmail