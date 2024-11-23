const db = require("../db/db")

function authenticateUserRole(roles){
	return async (req, res, next) => {
		const userId = req.user.id
		const org = req.user.organization
		const orgUserRole = await db("organization_user_roles")
		.join("user_roles", "organization_user_roles.user_role_id", "=", "user_roles.id")
		.where("user_id", userId)
		.where("organization_id", req.user.organization)
		.whereIn("user_roles.name", roles)
		.first()
		if (!orgUserRole){
			return res.status(401).json({error: "Unauthorized"})
		}
		next()
	}
}

module.exports = {
	authenticateUserRole
}