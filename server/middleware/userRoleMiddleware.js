const db = require("../db/db")

function authenticateUserRole(roles){
	return (req, res, next) => {
		const userId = req.user.id
	}
}

module.exports = {
	authenticateUserRole
}