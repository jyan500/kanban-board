const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { authenticateToken } = require("../middleware/authMiddleware")
const { validateBulkEdit } = require("../validation/organization")

router.get("/", async (req, res, next) => {
	try {
		const organizations = await db("organizations")
		.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true})		
		res.json(organizations)
	}
	catch (err){
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.get("/registration-request", authenticateToken, authenticateUserRole(["ADMIN", "BOARD_ADMIN"]), async (req, res, next) => {
	try {
		const registrationRequest = await db("user_registration_requests").where("organization_id", req.user.organization).join("users", "user_registration_requests.user_id", "=", "users.id").where("approved_at", null)
		.select(
			"user_registration_requests.id as id",
			"user_registration_requests.user_id as userId",
			"users.first_name as firstName",
			"users.last_name as lastName",
			"users.email as email",
			"user_registration_requests.created_at as createdAt"
		)
		.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true})		
		res.json(registrationRequest)
	}	
	catch (err) {
		console.log(`Error while getting registration requests: ${err.message}`)	
		next(err)
	}
})

router.get("/registration-request/:regId", authenticateToken, authenticateUserRole(["ADMIN", "BOARD_ADMIN"]), async (req, res, next) => {
	try {
		const registrationRequest = await db("user_registration_requests").where("id", req.params.regId)
		.select(
			"user_registration_requests.id as id",
			"user_registration_requests.user_id as userId",
			"user_registration_requests.organization_id as organizationId",
		)
		Promise.all(registrationRequest.map(async (regRequest) => {
			try {
				const user = await db("users").where("id", regRequest.userId).select(
					"users.id as id", 
					"users.first_name as firstName", 
					"users.last_name as lastName", 
					"users.email as email"
				).first()
				return {
					...regRequest,
					user: user
				}
			}
			catch (err){
			}
		})).then((resData) => {
			res.json({
				data: resData,
				pagination: registrationRequest.pagination,
			})
		})
	}	
	catch (err) {
		console.log(`Error while getting registration request: ${err.message}`)	
		next(err)
	}	
})

router.put("/registration-request/:regId", authenticateToken, authenticateUserRole(["ADMIN", "BOARD_ADMIN"]), async (req, res, next) => {
	try {
		const orgUser = await db("organization_user_roles").where("user_id", req.user.id).first()
		const userRole = await db("user_roles").where("name", "USER").first()
		await db("user_registration_requests").where("id", req.params.regId).update({
			"approved_at": new Date(),
			"org_user_id": orgUser?.id
		})
		const regRequest = await db("user_registration_requests").where("id", req.params.regId).first()
		await db("organization_user_roles").insert({
			user_id: regRequest?.user_id,
			organization_id: regRequest?.organization_id,
			user_role_id: userRole?.id
		})
		// TODO: email the user
		res.json({
			message: "User's registration process is complete"
		})
	}	
	catch (err) {
		console.log(`Error while updating registration requests: ${err.message}`)	
		next(err)
	}
})

router.post("/registration-request/bulk-edit", authenticateToken, authenticateUserRole(["ADMIN", "BOARD_ADMIN"]), validateBulkEdit, async (req, res, next) => {
	try {
		const regIds = req.body.user_registration_request_ids
		const userRole = await db("user_roles").where("name", "USER").first()
		const orgUser = await db("organization_user_roles").where("user_id", organizationsData, req.user.id).first()
		await db("user_registration_requests").whereIn("id", regIds).update({
			"approved_at": new Date(),
			"org_user_id": orgUser?.id
		})
		const regRequests = await db("user_registration_requests").whereIn("id", regIds)
		const toInsert = regRequests.map((regRequest) => {
			return {
				user_id: regRequest?.user_id,
				organization_id: regRequest?.organization_id,
				user_role_id: userRole?.id
			}
		})
		await db("organization_user_roles").insert(toInsert)
		// TODO: email the user
		res.json({
			message: "Users registration process is complete"
		})
	}	
	catch (err){
		console.log(`Error while updating registration requests: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const organization = await db("organizations").where("id", req.params.id).first()
		res.json(organization)
	}	
	catch (err){
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

module.exports = router
