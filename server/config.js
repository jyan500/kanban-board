require("dotenv").config()

const config = {
	companyName: "Kanban",
	saltRounds: 10,
	listPerPage: 10,
	domain: process.env.DOMAIN,
	environment: process.env.ENVIRONMENT
}

module.exports = config
