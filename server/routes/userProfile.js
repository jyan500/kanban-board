const express = require("express")
const router = express.Router()
const db = require("../db/db")

// see the logged in user's profile
router.get("/", async (req, res, next) => {
	try {
		// pulled from token middleware 
		const {id: userId, organization: organizationId, userRole} = req.user
		const userProfile = await db("organization_user_roles")
			.join("users", "users.id", "=", "organization_user_roles.user_id")
			.join("user_roles", "user_roles.id", "=", "organization_user_roles.user_role_id")
			.join("organizations", "organizations.id", "=", "organization_user_roles.organization_id")
			.where("users.id", userId)
			.where("organizations.id", organizationId)
			.select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.email as email", 
				"organizations.id as organizationId", 
				"user_roles.id as userRoleId").first()
		res.json(userProfile)
	}
	catch (err){
		console.log(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

router.get("/user-profile/:id", async (req, res, next) => {

})

module.exports = router