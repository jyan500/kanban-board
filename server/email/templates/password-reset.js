const { companyName, domain } = require("../../config")
const passwordResetTemplate = (firstName, lastName, passwordResetLink) => {
	return (
		`
		<div>
			<p>
				Dear ${firstName} ${lastName},
			</p>
			<p>
				Please click <a target="_blank" href="${domain}${passwordResetLink}">here</a> to reset your password. 
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
