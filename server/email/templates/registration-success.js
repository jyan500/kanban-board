const registrationSuccessTemplate = (firstName, lastName, organizationName) => {
	return (
		`
		<div>
			<p>
				Dear ${firstName} ${lastName},
			</p>
			<p>
				Your request to join the organization, <b>${organizationName}</b> has been approved. You are now able to login
				to the organization using your credentials.
			</p>
			<p>
				Thank you,
			</p>
			<p>Kanban</p>
		</div>
		`
	)
}

module.exports = registrationSuccessTemplate
