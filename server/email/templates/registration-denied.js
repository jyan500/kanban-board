const registrationDeniedTemplate = (firstName, lastName, organizationName, organizationEmail, organizationPhone) => {
	return (
		`
		<div>
			<p>
				Dear ${firstName} ${lastName},
			</p>
			<p>
				Unfortunately, your request to join the organization, <b>${organizationName}</b> has been <b>denied</b>.
				To dispute this decision, please contact the organization.

				<p>${organizationName}</p>
				<p>${organizationEmail}</p>
				<p>${organizationPhone}</p>
			</p>
			<p>
				Thank you,
			</p>
			<p>Kanban</p>
		</div>
		`
	)
}

module.exports = registrationDeniedTemplate
