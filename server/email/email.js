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
 * sends email using nodemailer using mailtrap server for DEV,
 * or gmail SMTP for prod
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
			console.log('Message sent: %s', info.messageId)
		}
		else {

			console.log('Test Environment: message not sent. Debug log: \n%s', `From: ${config.email} \nTo: ${to} \nSubject: ${subject} \n${template()}`);
		}
	} catch (error) {
		console.error('Error sending email:', error);
	}
}

/**
 * takes in multiple recipients, creates an array of promises and then sends them all in bulk
 * @param recipients: object containing {email, firstName, lastName, orgName, orgEmail, orgPhoneNum}
 * @param subject: email subject
 * @param template: email template
 */ 
const sendBulkEmail = async (recipients, subject, template) => {
	try {
		if (process.env.ENVIRONMENT === "DEV" || process.env.ENVIRONMENT === "PROD"){
			const emails = recipients.map((recipient) => {
				return transporter.sendMail({
					from: config.email,
					to: recipient.email,	
					subject: subject,
					html: template(recipient.firstName, recipient.lastName, recipient.orgName, recipient.orgEmail ?? "", recipient.orgPhoneNum ?? "")
				})
			})
			Promise.all(emails)
			   .then(results => {
			       console.log('All emails sent successfully');
			       results.forEach(result => {
			           console.log(`Message to ${result.envelope.to} sent: ${result.messageId}`);
			       });
			   })
			   .catch(errors => {
			       console.error('Failed to send one or more emails:', errors);
			   });
		}
		else {
			recipients.forEach((recipient) => {
				console.log('Test Environment: message not sent. Debug log: \n%s', `From: ${config.email} \nTo: ${recipient.email} \nSubject: ${subject} \n${template(recipient.firstName, recipient.lastName, recipient.orgName, recipient.orgEmail, recipient.orgPhoneNum)}`);
			})
		}
	}
	catch (error){
		console.error('Error sending email:', error);
	}
}

module.exports = {
	sendEmail,
	sendBulkEmail
}
