const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { getUserValidator, editUserValidator, editOwnUserValidator, editUserImageValidator, editNotificationTypesValidator } = require("../validation/user")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { validateAddOrganization } = require("../validation/organization") 
const { DEFAULT_STATUSES } = require("../constants")
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
				if (req.query.userIds){
					queryBuilder.whereIn("users.id", req.query.userIds.split(","))
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
				"users.image_url as imageUrl",
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

router.post("/image", editUserImageValidator, handleValidationResult, async (req, res, next) => {
	try {
		await db("users").where("id", req.body.id).update({
			image_url: req.body.image_url
		})
		res.json({message: "User profile image uploaded successfully!"})
	}	
	catch (err){
		console.error(`Error while updating user profile: ${err.message}`)
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
				"users.image_url as imageUrl",
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
			image_url: req.body.image_url,
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

router.get("/notification-type", async (req, res, next) => {
	try {
		const {id: userId, organization: organizationId } = req.user
		const userNotificationTypes = await db("users_to_notification_types").where("user_id", userId).select(
			"id as id",
			"user_id as userId",
			"notification_type_id as notificationTypeId"
		)
		res.json(userNotificationTypes)
	}	
	catch (err){
		console.log(`Error while getting user notification types: ${err.message}`)	
		next(err)
	}
})

router.post("/notification-type", editNotificationTypesValidator, handleValidationResult, async (req, res, next) => {
	try {
		const {id: userId, organization: organizationId } = req.user
		// delete all notification type ids attached to this user and then re-insert
		const toInsert = req.body.ids.map((id) => ({user_id: userId, notification_type_id: id}))
		await db("users_to_notification_types").where("user_id", userId).delete()
		await db("users_to_notification_types").insert(toInsert)
		res.json({message: "notification types updated successfully"})
	}	
	catch (err){
		console.log(`Error while updating user notification types: ${err.message}`)
	}
})

router.get("/organization", async (req, res, next) => {
	try {
		const {id: userId, organization: organizationId} = req.user
		let organizations;
		if (req.query.getJoinedOrgs === "false"){
			organizations = db("organizations").whereNotIn("organizations.id", 
				db("organization_user_roles").where("organization_user_roles.user_id", userId).select("organization_user_roles.organization_id")
			)
			.modify((queryBuilder) => {
				if (req.query.query){
					queryBuilder.whereILike("organizations.name", `%${req.query.query}%`)
				}
			})
		}
		else {
			organizations = db("organization_user_roles")
			.join("organizations", "organizations.id", "=", "organization_user_roles.organization_id")
			.modify(queryBuilder => {
				if (req.query.query){
					queryBuilder.whereILike("organizations.name", `%${req.query.query}%`)
				}
				if (req.query.excludeOwn){
					// exclude the currently logged in organization
					queryBuilder.whereNot("organizations.id", organizationId)
				}
			})
			.where("organization_user_roles.user_id", userId)
		}
		organizations = await organizations.select(
			"organizations.id as id",
			"organizations.name as name",
		).paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		res.json(organizations)
	}	
	catch (err) {
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.post("/organization", validateAddOrganization, handleValidationResult, async (req, res, next) => {
	try {
		const { name, email, phone_number, address, city, state, zipcode, industry } = req.body
		const organization = await db("organizations").insert({
			name, email, phone_number, address, city, state, zipcode, industry	
		}, ["id"])
		// create the admin user role for the new user
		const adminUserRole = await db("user_roles").where("name", "ADMIN").first()
		await db("organization_user_roles").insert({
			user_id: req.user.id,
			organization_id: organization[0],
			user_role_id: adminUserRole?.id
		})
		// attach default statuses for the new organization
		await db("statuses").insert(DEFAULT_STATUSES.map((status) => ({...status, organization_id: organization[0]})))

		res.json({message: "Organization registered successfully!"})
	}
	catch (err){
		console.log(`Error while adding organization: ${err.message}`)	
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
			.where("organization_user_roles.organization_id", req.user.organization)
			.select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.email as email", 
				"users.image_url as imageUrl",
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
