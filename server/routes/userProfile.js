const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { getUserValidator, editUserValidator, editOwnUserValidator, editUserImageValidator, editNotificationTypesValidator, validateUserBoardFilterGet, validateUserBoardFilterUpdate } = require("../validation/user")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { validateAddOrganization } = require("../validation/organization") 
const { DEFAULT_STATUSES } = require("../constants")
const bcrypt = require("bcrypt")
const config = require("../config")
const {authenticateUserActivated} = require("../middleware/userActivatedMiddleware")
const { insertAndGetId } = require("../helpers/functions")
const HistoryService = require('../services/history-service')

const historyService = new HistoryService(db)

router.get("/", async (req, res, next) => {
	try {
		// pulled from token middleware 
		const {id: userId, organization: organizationId, userRole} = req.user
		const userProfiles = await db("organization_user_roles")
			.where("organization_user_roles.organization_id", organizationId)
			.join("users", "users.id", "=", "organization_user_roles.user_id")
			.join("user_roles", "user_roles.id", "=", "organization_user_roles.user_role_id")
			.modify((queryBuilder) => {
				if (req.query.query || req.query.userQuery){
					const query = req.query.query ?? req.query.userQuery
					queryBuilder.where((queryBuilder2) => queryBuilder2.whereILike("users.first_name", `%${query}%`).orWhereILike("users.last_name", `%${query}%`))
				}
				if ("userIds" in req.query){
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
				"users.is_active as isActive",
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
		console.error(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

router.post("/image", editUserImageValidator, handleValidationResult, async (req, res, next) => {
	try {
		await historyService.update(
			"users",
			req.body.id,
			{
				image_url: req.body.image_url
			},
			req.historyContext
		)
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
		const {id: userId, organization: organizationId, userRole, is_temp} = req.user
		if (is_temp){
			const userProfile = await db("users").where("id", userId).select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.is_active as isActive",
				"users.image_url as imageUrl",
				"users.email as email", 
			).first()
			res.json(userProfile)
			return
		}
		else {
			const userProfile = await db("organization_user_roles")
				.join("users", "users.id", "=", "organization_user_roles.user_id")
				.join("organizations", "organization_user_roles.organization_id", "=", "organizations.id")
				.where("organization_user_roles.user_id", userId)
				.where("organization_user_roles.organization_id", organizationId)
				.select(
					"users.id as id", 
					"users.first_name as firstName", 
					"users.last_name as lastName", 
					"users.is_active as isActive",
					"users.image_url as imageUrl",
					"users.email as email", 
					"organizations.name as organizationName",
					"organization_user_roles.organization_id as organizationId", 
					"organization_user_roles.user_role_id as userRoleId").first()
			res.json(userProfile)
		}
	}
	catch (err){
		console.error(`Error while getting user profile: ${err.message}`)	
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
		await historyService.update(
			"users",
			userId,
			{
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				image_url: req.body.image_url,
				...(req.body.change_password ? {
					password: hash	
				} : {})
			},
			req.historyContext
		)
		res.json({message: "Account updated successfully!"})
	}	
	catch (err){
		console.error(`Error while getting user profile: ${err.message}`)	
		next(err)
	}
})

router.get("/notification-type", authenticateUserActivated, async (req, res, next) => {
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
		console.error(`Error while getting user notification types: ${err.message}`)	
		next(err)
	}
})

router.post("/notification-type", authenticateUserActivated, editNotificationTypesValidator, handleValidationResult, async (req, res, next) => {
	try {
		const {id: userId, organization: organizationId } = req.user
		// delete all notification type ids attached to this user and then re-insert
		const toInsert = req.body.ids.map((id) => ({user_id: userId, notification_type_id: id}))
		await db("users_to_notification_types").where("user_id", userId).delete()
		await db("users_to_notification_types").insert(toInsert)
		res.json({message: "notification types updated successfully"})
	}	
	catch (err){
		console.error(`Error while updating user notification types: ${err.message}`)
		next(err)
	}
})

router.get("/board-filter", authenticateUserActivated, validateUserBoardFilterGet, handleValidationResult, async (req, res, next) => {
	try {
		const { id: userId } = req.user
		const data = await db("users_to_board_filters")
		.where("users_to_board_filters.user_id", userId)
		.join("boards_to_filters", "boards_to_filters.id", "=", "users_to_board_filters.board_filter_id")
		.join("filters", "filters.id", "=", "boards_to_filters.filter_id")
		.select(
			"users_to_board_filters.id as id",
			"boards_to_filters.id as boardFilterId",
			"filters.name as name",
			"filters.order as order",
			"users_to_board_filters.value as value"
		)
		res.json(data)
	}
	catch (err) {
		console.error(`Error while getting board filters: ${err.message}`)
		next(err)
	}
})

router.post("/board-filter", authenticateUserActivated, validateUserBoardFilterUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const { id: userId } = req.user
		const existingFilters = await db("users_to_board_filters").where("user_id", userId)
		const existingFilterIds = existingFilters.map((filter) => filter.board_filter_id)
		const idsToAdd = req.body.ids.filter((idObj) => !existingFilterIds.includes(idObj.board_filter_id))
		const idsToDelete = existingFilterIds.filter((id) => !req.body.ids.map(idObj => idObj.board_filter_id).includes(id))
		if (idsToAdd.length){
			await db("users_to_board_filters").insert(idsToAdd.map((idObj) => {
				return {
					user_id: userId,
					board_filter_id: idObj.board_filter_id,
					value: idObj.value,
				}
			}))
		}
		if (idsToDelete.length){
			await db("users_to_board_filters").where("user_id", userId).whereIn("board_filter_id", idsToDelete).del()
		}
		res.json({message: "Board filters attached to user successfully!"})
	}
	catch (err){
		console.error(`Error while adding board filters to user: ${err.message}`)
		next(err)
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
		console.error(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.post("/activate", async (req, res, next) => {
	try {
		await historyService.update(
			"users",
			req.user.id,
			{
				is_active: true,
				activation_token: undefined,
				activation_token_expires: undefined,
			},
			req.historyContext
		)
		res.json({message: "Account activated successfully!"})
	}
	catch (err){
		console.error(`Error while activating account: ${err.message}`)	
		next(err)
	}
})

router.post("/organization", authenticateUserActivated, validateAddOrganization, handleValidationResult, async (req, res, next) => {
	try {
		const { name, email, phone_number, address, city, state, zipcode, industry } = req.body
		const organizationId = await insertAndGetId("organizations", {
			name, email, phone_number, address, city, state, zipcode, industry	
		})
		// create the admin user role for the new user
		const adminUserRole = await db("user_roles").where("name", "ADMIN").first()
		await db("organization_user_roles").insert({
			user_id: req.user.id,
			organization_id: organizationId,
			user_role_id: adminUserRole?.id
		})
		// attach default statuses for the new organization
		await db("statuses").insert(DEFAULT_STATUSES.map((status) => ({...status, organization_id: organizationId})))

		res.json({message: "Organization registered successfully!"})
	}
	catch (err){
		console.error(`Error while adding organization: ${err.message}`)	
		next(err)
	}
})



// get a user
router.get("/:userId", getUserValidator, handleValidationResult, async (req, res, next) => {
	try {
		const userId = req.params.userId
		const isTemp = req.user.is_temp
		let userProfile
		if (!isTemp){
			userProfile = await db("organization_user_roles")
				.join("users", "users.id", "=", "organization_user_roles.user_id")
				.where("users.id", userId)
				.where("organization_user_roles.organization_id", req.user.organization)
				.select(
					"users.id as id", 
					"users.first_name as firstName", 
					"users.last_name as lastName", 
					"users.email as email", 
					"users.is_active as isActive",
					"users.image_url as imageUrl",
					"organization_user_roles.organization_id as organizationId", 
					"organization_user_roles.user_role_id as userRoleId").first()
		}
		else {
			userProfile = await db("users").where("users.id", userId).select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.email as email", 
				"users.is_active as isActive",
				"users.image_url as imageUrl",
			).first()
		}
		res.json(userProfile)
	}	
	catch (err){
		console.error(`Error while getting user profile: ${err.message}`)
		next(err)
	}
})

router.get("/:userId/registration-request", getUserValidator, handleValidationResult, async (req, res, next) => {
	try {
		const userId = req.params.userId
		const registrationRequests = await db("user_registration_requests")
		.where("user_id", userId)
		.join("organizations", "organizations.id", "=", "user_registration_requests.organization_id")
		.modify((queryBuilder) => {
			if (req.query.query){
				queryBuilder.whereILike("organizations.name", `%${req.query.query}%`) 
			}
		})
		.select(
			"user_registration_requests.id as id",
			"user_registration_requests.organization_id as organizationId",
			"organizations.name as organizationName",
			"user_registration_requests.user_id as userId",
			"user_registration_requests.approved_at as approvedAt",
			"user_registration_requests.denied_at as deniedAt",
			"user_registration_requests.created_at as createdAt")
		.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		const parsedWithStatus = registrationRequests.data.map((request) => {
			if (request.approvedAt == null && request.deniedAt == null){
				return {
					...request,
					status: "Pending",
				}
			}
			else if (request.approvedAt != null){
				return {
					...request,
					status: "Approved",
				}
			}
			else if (request.deniedAt != null){
				return {
					...request,
					status: "Denied"
				}
			}
		})
		res.json({
			data: parsedWithStatus,
			pagination: registrationRequests.pagination
		})
	}	
	catch (err){
		console.error(`Error while getting registration requests: ${err.message}`)
		next(err)
	}
})

router.put("/:userId", authenticateUserRole(["ADMIN"]), editUserValidator, handleValidationResult, async (req, res, next) => {
	try {
		const userId = req.params.userId
		await historyService.update(
			"users",
			userId,
			{
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
			},
			req.historyContext
		)
		if (req.body.user_role_id){
			await db("organization_user_roles").update({
				user_role_id: req.body.user_role_id
			}).where("user_id", userId).where("organization_id", req.user.organization)
		}
		res.json({message: "User profile updated successfully!"})
	}	
	catch (err){
		console.error(`Error while updating user profile: ${err.message}`)
		next(err)
	}
})


module.exports = router
