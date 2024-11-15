const express = require("express")
const router = express.Router()
const db = require("../db/db")

// see the logged in user's profile
router.get("/me", async (req, res, next) => {
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

router.get("/organization", async (req, res, next) => {
	try {
		const {id: userId, organization: organizationId} = req.user
		const organizations = await db("organization_user_roles")
		.join("organizations", "organizations.id", "=", "organization_user_roles.organization_id")
		.where("organization_user_roles.user_id", userId)
		// exclude the currently logged in organization
		.whereNot("organizations.id", organizationId)
		.select(
			"organizations.id as id",
			"organizations.name",
		).paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		res.json(organizations)
	}	
	catch (err) {
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.get("/", async (req, res, next) => {
	try {
		// pulled from token middleware 
		const {id: userId, organization: organizationId, userRole} = req.user
		const userProfiles = await db("organization_user_roles")
			.join("users", "users.id", "=", "organization_user_roles.user_id")
			.join("user_roles", "user_roles.id", "=", "organization_user_roles.user_role_id")
			.join("organizations", "organizations.id", "=", "organization_user_roles.organization_id")
			.where("organizations.id", organizationId)
			// .modify((queryBuilder) => {
			// 	// users can only see other users
			// 	if (userRole === "USER"){
			// 		queryBuilder.where("user_roles.name", "USER")
			// 	}
			// 	// board admins can see users and board admins 
			// 	else if (userRole === "BOARD_ADMIN"){
			// 		queryBuilder.where("user_roles.name", "USER").orWhere("user_roles.name", "BOARD_ADMIN")
			// 	}
			// 	// admins can see all users, no condition needed
			// })
			.select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.email as email", 
				"organizations.id as organizationId", 
				"user_roles.id as userRoleId")
		res.json(userProfiles)
	}
	catch (err){
		console.log(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

module.exports = router