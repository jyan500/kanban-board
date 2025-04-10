require("dotenv").config()

const config = {
	companyName: "Kanban",
	saltRounds: 10,
	listPerPage: 10,
	maxTransactionRetries: 15,
	domain: process.env.DOMAIN,
	environment: process.env.ENVIRONMENT,
	email: "Kanban"
}

module.exports = config
