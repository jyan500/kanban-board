const nodemailer = require("nodemailer")
const config = require("../config")
require("dotenv").config()

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	}
})

/**
 * sends email using nodemailer using mailtrap server
 * @param to: user email
 * @param subject: email subject
 * @param template: user email
 */
const sendEmail = async (to, subject, template) => {
	try {
		if (process.env.ENVIRONMENT === "PROD" || process.env.ENVIRONMENT === "DEV"){
			const info = await transporter.sendMail({
				from: config.email,
				to: to,
				subject: subject,
				html: template() 
			});
			console.log('Message sent: %s', info.messageId);
		}
		else {
			console.log('Test Environment: message not sent. Debug log: \n%s', `From: ${config.email} \nTo: ${to} \nSubject: ${subject} \n${template()}`);
		}

	} catch (error) {
		console.error('Error sending email:', error);
	}
}

module.exports = sendEmail
