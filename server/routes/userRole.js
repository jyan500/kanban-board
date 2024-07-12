const express = require("express")
const router = express.Router()
const db = require("../db/db")

// get user roles
router.get("/", async (req, res, next) => {
	try {
		const userRoles = await db("user_roles")
			.select(
				"user_roles.id as id",
				"user_roles.name as name"
			)
		res.json(userRoles)
	}
	catch (err){
		console.log(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

module.exports = router