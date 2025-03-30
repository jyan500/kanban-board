const nodemailer = require("nodemailer")
const config = require("../config")
const { Resend } = require("resend")
require("dotenv").config()

const resend = new Resend(process.env.RESEND_API_URL);

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
 * or resend API for prod
 * @param to: user email
 * @param subject: email subject
 * @param template: user email
 */
const sendEmail = async (to, subject, template) => {
	try {
		if (process.env.ENVIRONMENT === "PROD"){
			const {id} = await resend.emails.send({
				from: config.email,
				to: to,
				subject: subject,
				html: template()
			})
			console.log('Message sent: %s', id)
		}
		else if (process.env.ENVIRONMENT === "DEV"){
			const info = await transporter.sendMail({
				from: config.email,
				to: to,
				subject: subject,
				html: template() 
			});
			console.log('Message sent: %s', info.messageId)
		}
		else if (process.env.ENVIRONMENT === "TEST"){

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
		if (process.env.ENVIRONMENT === "PROD"){
			const emails = recipients.map((recipient) => {
				return {	
				    from: config.email,
				    to: recipient.email,
				    subject: subject,
				    html: template(recipient.firstName, recipient.lastName, recipient.orgName, recipient.orgEmail ?? "", recipient.orgPhoneNum ?? ""),
			    }
			})
			const { data } = await resend.batch.send(emails)
			console.log(`${data.length} emails sent successfully!`)
		}
		else if (process.env.ENVIRONMENT === "DEV"){
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
		else if (process.env.ENVIRONMENT === "TEST") {
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
