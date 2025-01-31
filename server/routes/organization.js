const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { authenticateToken } = require("../middleware/authMiddleware")
const { 
	validateUpdate, 
	validateBulkEdit, 
	validateAddOrganization, 
	validateUpdateOrganization 
} = require("../validation/organization")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const sendEmail = require("../email/email")
const registrationSuccessTemplate = require("../email/templates/registration-success") 
const registrationRequestTemplate = require("../email/templates/registration-request") 
const registrationDeniedTemplate = require("../email/templates/registration-denied") 

router.get("/", async (req, res, next) => {
	try {
		const organizations = await db("organizations")
		.select(
			"organizations.id as id",
			"organizations.name as name",
			"organizations.email as email",
			"organizations.phone_number as phoneNumber",
			"organizations.address as address",
			"organizations.city as city",
			"organizations.state as state",
			"organizations.zipcode as zipcode",
			"organizations.industry as industry",
			"organizations.image_url as imageUrl",
		)
		.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true})		
		res.json(organizations)
	}
	catch (err){
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.get("/registration-request", authenticateToken, authenticateUserRole(["ADMIN"]), async (req, res, next) => {
	try {
		const registrationRequest = await db("user_registration_requests")
		.where("organization_id", req.user.organization)
		.join("users", "user_registration_requests.user_id", "=", "users.id")
		.modify((queryBuilder) => {
			if (req.query.query || req.query.regQuery){
				const query = req.query.query ?? req.query.regQuery
				queryBuilder.whereILike("users.first_name", `%${query}%`).orWhereILike("users.last_name", `%${query}%`)
			}
		})
		.select(
			"user_registration_requests.id as id",
			"user_registration_requests.user_id as userId",
			"users.first_name as firstName",
			"users.last_name as lastName",
			"users.email as email",
			"user_registration_requests.approved_at as approvedAt",
			"user_registration_requests.denied_at as deniedAt",
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

router.post("/registration-request", authenticateToken, async (req, res, next) => {
	try {
		const joinOrg = req.body.organization_id
		await db("user_registration_requests").insert({
			"user_id": req.user.id,
			"organization_id": joinOrg 
		})
		const organization = await db("organizations").where("id", req.body.organization_id).first()
		const user = await db("users").where("id", req.user.id).first()
		// TODO: send this to an async queue so the request isn't held up by email sending
		// send email to registered user
		if (user && organization){
		    await sendEmail(user.email, "Registration Request Submitted", () => registrationRequestTemplate(user.first_name, user.last_name, organization.name))
		}
		res.json({"message": "Your request has been filed. You will be notified when your request has been accepted."})

	}	
	catch (err) {
		console.error(`Error while inserting registration request: ${err.message}`)	
		next(err)
	}
})

router.get("/registration-request/:regId", authenticateToken, authenticateUserRole(["ADMIN"]), async (req, res, next) => {
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

router.put("/registration-request/:regId", authenticateToken, authenticateUserRole(["ADMIN"]), validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const isApprove = req.body.approve
		const regRequest = await db("user_registration_requests").where("id", req.params.regId).first()
		const organization = await db("organizations").where("id", regRequest?.organization_id).first()
		const user = await db("users").where("id", regRequest?.user_id).first()
		const orgUser = await db("organization_user_roles").where("user_id", req.user.id).first()
		if (isApprove){
			const userRole = await db("user_roles").where("name", "USER").first()
			await db("user_registration_requests").where("id", req.params.regId).update({
				"approved_at": new Date(),
				"org_user_id": orgUser?.id
			})
			await db("organization_user_roles").insert({
				user_id: regRequest?.user_id,
				organization_id: regRequest?.organization_id,
				user_role_id: userRole?.id
			})
			// TODO: send this to an async queue so the request isn't held up by email sending
			// send email to notify about success
			if (user && organization){
			    await sendEmail(user.email, "Registration Request Accepted", () => registrationSuccessTemplate(user.first_name, user.last_name, organization.name))
			}
			res.json({
				message: "User's registration process is complete"
			})
		}
		else {
			await db("user_registration_requests").where("id", req.params.regId).update({
				"denied_at": new Date(),
				"org_user_id": orgUser?.id
			})
			// TODO: send this to an async queue so the request isn't held up by email sending
			// send email to notify about denial
			if (user && organization){
				await sendEmail(user.email, "Registration Request Denied", () => registrationDeniedTemplate(user.first_name, user.last_name, organization.name, organization.email ?? "", organization.phone_number ?? ""))
			}
			res.json({
				message: "User's registration process was denied."
			})
		}
	}	
	catch (err) {
		console.log(`Error while updating registration requests: ${err.message}`)	
		next(err)
	}
})

router.post("/registration-request/bulk-edit", authenticateToken, authenticateUserRole(["ADMIN"]), validateBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const isApprove = req.body.approve
		const regIds = req.body.user_registration_request_ids
		const orgUser = await db("organization_user_roles").where("user_id", req.user.id).first()
		if (isApprove){
			const userRole = await db("user_roles").where("name", "USER").first()
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
		else {
			await db("user_registration_requests").whereIn("id", regIds).update({
				"denied_at": new Date(),
				"org_user_id": orgUser?.id
			})
			res.json({
				message: "Users registration requests were denied"
			})
		}
	}	
	catch (err){
		console.log(`Error while updating registration requests: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const organization = await db("organizations").where("id", req.params.id).select(
			"organizations.id as id",
			"organizations.name as name",
			"organizations.email as email",
			"organizations.phone_number as phoneNumber",
			"organizations.address as address",
			"organizations.city as city",
			"organizations.state as state",
			"organizations.zipcode as zipcode",
			"organizations.industry as industry",
			"organizations.image_url as imageUrl"
		).first()
		res.json(organization)
	}	
	catch (err){
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.put("/:id", authenticateToken, authenticateUserRole(["ADMIN"]), validateUpdateOrganization, handleValidationResult, async (req, res, next) => {
	try {
		const { name, email, phone_number, address, city, state, zipcode, industry } = req.body
		await db("organizations").where("id", req.params.id).update({
			name, email, phone_number, address, city, state, zipcode, industry	
		})
		res.json({"message": "Organization updated successfully!"})
	}	
	catch (err){
		console.log(`Error while updating organization: ${err.message}`)	
		next(err)
	}
})

router.post("/image", authenticateToken, authenticateUserRole(["ADMIN"]), handleValidationResult, async (req, res, next) => {
	try {
		await db("organizations").where("id", req.body.id).update({
			image_url: req.body.image_url
		})
		res.json({message: "Organization image uploaded successfully!"})
	}	
	catch (err){
		console.error(`Error while updating organization: ${err.message}`)
		next(err)
	}
})

router.post("/", validateAddOrganization, handleValidationResult, async (req, res, next) => {
	try {
		const { name, email, phone_number, address, city, state, zipcode, industry } = req.body
		const id = await db("organizations").insert({
			name, email, phone_number, address, city, state, zipcode, industry	
		}, ["id"])
		res.json({"id": id[0], "message": "Organization added successfully!"})
	}	
	catch (err){
		console.log(`Error while updating organization: ${err.message}`)	
		next(err)
	}
})

module.exports = router
