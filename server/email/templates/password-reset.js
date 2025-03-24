const { companyName, domain, adminEmail } = require("../../config")
const passwordResetTemplate = (firstName, lastName, passwordResetLink) => {
	return (
		`
		<div>
			<p>
				Dear ${firstName} ${lastName},
			</p>
			<p>
				Please click <a href="${domain}${passwordResetLink}">here</a> to reset your password. If you didn't make this request to change your password, please
				contact us at <a href="mailto:${adminEmail}">${adminEmail}</a>
			</p>
			<p>
				Thank you,
			</p>
			<p>${companyName}</p>
		</div>
		`
	)
}

module.exports = passwordResetTemplate
