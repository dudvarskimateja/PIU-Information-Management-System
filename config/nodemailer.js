const { google } = require('googleapis')
const nodemailer = require('nodemailer')

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
)

console.log('Environment Variables:', {
  ClientID: process.env.GOOGLE_CLIENT_ID,
  ClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  RefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
})

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

async function sendEmail(to, subject, message) {
  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: "matejadudvarski@gmail.com",
      subject: "Document Approval Notification from PIUME",
      text: "Greetings,\n\nWe are pleased to inform you that your document submission has been thoroughly reviewed and officially accepted by our engineering team at PIUME. Should you require any further information or assistance, please do not hesitate to contact us.\n\nThank you for your submission and for choosing PIUME.\n\nBest Regards,\nThe PIUME Team",
      html: "<p>Greetings,</p><p>We are pleased to inform you that your document submission has been thoroughly reviewed and officially accepted by our engineering team at <strong>PIUME</strong>. Should you require any further information or assistance, please do not hesitate to contact us.</p><p>Thank you for your submission and for choosing PIUME.</p><p>Best Regards,<br>The PIUME Team</p>"
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

module.exports = { sendEmail }
