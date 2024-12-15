const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { getUserValidator, editUserValidator, editOwnUserValidator } = require("../validation/user")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const bcrypt = require("bcrypt")
const config = require("../config")

router.get("/", async (req, res, next) => {
	try {
		// pulled from token middleware 
		const {id: userId, organization: organizationId, userRole} = req.user
		const userProfiles = await db("organization_user_roles")
			.join("users", "users.id", "=", "organization_user_roles.user_id")
			.where("organization_user_roles.organization_id", organizationId)
			.join("user_roles", "user_roles.id", "=", "organization_user_roles.user_role_id")
			.modify((queryBuilder) => {
				if (req.query.query || req.query.userQuery){
					const query = req.query.query ?? req.query.userQuery
					queryBuilder.whereILike("users.first_name", `%${query}%`).orWhereILike("users.last_name", `%${query}%`)
				}
				if (req.query.filterOnUserRole){
					if (userRole === "USER"){
						queryBuilder.where("user_roles.name", "USER")	
					}
				}
				if (req.query.excludeUsers){
					queryBuilder.whereNotIn("organization_user_roles.user_id", req.query.excludeUsers.split(","))	
				}
			})
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
			.orderBy("first_name", "asc")
			.select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName",
				"user_roles.id as userRoleId",
				"users.email as email") 
			.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		const userProfilesParsed = req.query.forSelect ? userProfiles.data.map((userProfile) => {
			return {
				id: userProfile.id,
				name: userProfile.firstName + " " + userProfile.lastName
			}
		}) : userProfiles.data
		res.json({
			...userProfiles,
			data: userProfilesParsed
		})
	}
	catch (err){
		console.log(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

// see the logged in user's profile
router.get("/me", async (req, res, next) => {
	try {
		// pulled from token middleware 
		const {id: userId, organization: organizationId, userRole} = req.user
		const userProfile = await db("organization_user_roles")
			.join("users", "users.id", "=", "organization_user_roles.user_id")
			.join("organizations", "organization_user_roles.organization_id", "=", "organizations.id")
			.where("organization_user_roles.user_id", userId)
			.where("organization_user_roles.organization_id", organizationId)
			.select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.email as email", 
				"organizations.name as organizationName",
				"organization_user_roles.organization_id as organizationId", 
				"organization_user_roles.user_role_id as userRoleId").first()
		res.json(userProfile)
	}
	catch (err){
		console.log(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

router.post("/me", editOwnUserValidator, handleValidationResult, async (req, res, next) => {
	try {
		const {id: userId, organization: organizationId } = req.user
		let salt;
		let hash;
		if (req.body.change_password){
			salt = await bcrypt.genSalt(config.saltRounds)
			hash = await bcrypt.hash(req.body.password, salt)
		}
		await db("users").update({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			...(req.body.change_password ? {
				password: hash	
			} : {})
		}).where("id", userId)
		res.json({message: "Account updated successfully!"})
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
		.modify(queryBuilder => {
			if (req.query.query){
				queryBuilder.whereILike("organizations.name", `%${req.query.query}%`)
			}
		})
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


// get a user
router.get("/:userId", getUserValidator, handleValidationResult, async (req, res, next) => {
	try {
		const userId = req.params.userId
		const userProfile = await db("organization_user_roles")
			.join("users", "users.id", "=", "organization_user_roles.user_id")
			.where("users.id", userId)
			.select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.email as email", 
				"organization_user_roles.organization_id as organizationId", 
				"organization_user_roles.user_role_id as userRoleId").first()
		res.json(userProfile)
	}	
	catch (err){
		console.log(`Error while getting user profile: ${err.message}`)
		next(err)
	}
})

router.put("/:userId", authenticateUserRole(["ADMIN"]), editUserValidator, handleValidationResult, async (req, res, next) => {
	try {
		const userId = req.params.userId
		await db("users").update({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
		}).where("id", userId)
		if (req.body.user_role_id){
			await db("organization_user_roles").update({
				user_role_id: req.body.user_role_id
			}).where("user_id", userId).where("organization_id", req.user.organization)
		}
		res.json({message: "User profile updated successfully!"})
	}	
	catch (err){
		console.log(`Error while updating user profile: ${err.message}`)
		next(err)
	}
})

module.exports = router
