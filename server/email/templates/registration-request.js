const registrationRequestTemplate = (firstName, lastName, organizationName) => {
	return (
		`
		<div>
			<p>
				Dear ${firstName} ${lastName},
			</p>
			<p>
				You have successfully requested to register under the organization: ${organizationName}. 
				You will be notified by email when your registration request is accepted.
			</p>
			<p>
				Thank you,
			</p>
			<p>Kanban</p>
		</div>
		`
	)
}

module.exports = registrationRequestTemplate
