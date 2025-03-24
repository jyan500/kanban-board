const db = require("../db/db")

function authenticateUserActivated(roles){
	return async (req, res, next) => {
		const userId = req.user.id
		const user = await db("users")
		.where("user_id", userId)
		.first()
		if (!user.isActive){
			return res.status(401).json({error: "Unauthorized"})
		}
		next()
	}
}

module.exports = {
	authenticateUserActivated
}