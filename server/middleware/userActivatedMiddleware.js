const db = require("../db/db")

async function authenticateUserActivated(req, res, next){
	const userId = req.user.id
	const user = await db("users")
	.where("id", userId)
	.first()
	if (!user.is_active){
		return res.status(401).json({error: "Unauthorized"})
	}
	next()
}

module.exports = {
	authenticateUserActivated
}