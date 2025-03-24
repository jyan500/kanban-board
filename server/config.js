require("dotenv").config()

const config = {
	companyName: "Kanban",
	saltRounds: 10,
	listPerPage: 10,
	email: "noreply@kanban.com",
	adminEmail: "admin@kanban.com",
	domain: process.env.DOMAIN
}

module.exports = config
