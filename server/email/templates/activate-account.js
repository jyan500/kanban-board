const { companyName, domain, adminEmail } = require("../../config")
const activateAccountTemplate = (firstName, lastName, activationLink, isRegRequest=false, organizationName="") => {
	const regRequestMessage = isRegRequest ? `
		<p>
			You have successfully requested to register under the organization: ${organizationName}. 
			You will be notified by email when your registration request is accepted.
		</p>
		<p>
			In the meantime, please activate your account by clicking on the link <a href = "${domain}${activationLink}">here</a>.
		</p>
	` : `
		<p>You have registered your account and organization successfully!</p>
		<p>
			Please click <a href = "${domain}${activationLink}">here</a> to activate your account.
		</p>
	`
	return (
		`
		<div>
			<p>
				Dear ${firstName} ${lastName},
			</p>
			${regRequestMessage}
			<p>
				Thank you,
			</p>
			<p>${companyName}</p>
		</div>
		`
	)
}

module.exports = activateAccountTemplate
