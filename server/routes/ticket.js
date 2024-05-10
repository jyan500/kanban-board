const express = require("express")
const router = express.Router()
const { 
	validateGet,
	validateCreate, 
	validateUpdate, 
	validateDelete,
	validateTicketUserGet,
	validateTicketUserCreate,
	validateTicketUserDelete,

}  = require("../validation/ticket")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const tickets = await db("tickets").where("organization_id", req.user.organization).select(
			"tickets.id as id",
			"tickets.priority_id as priorityId",
			"tickets.name as name",
			"tickets.description as description",
			"tickets.status_id as statusId",
			"tickets.ticket_type_id as ticketTypeId",
			"tickets.organization_id as organizationId"
		)
		res.json(tickets)
	}
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.get("/:ticketId", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const tickets = await db("tickets").where("id", req.params.ticketId).select(
			"tickets.id as id",
			"tickets.priority_id as priorityId",
			"tickets.name as name",
			"tickets.description as description",
			"tickets.status_id as statusId",
			"tickets.ticket_type_id as ticketTypeId",
			"tickets.organization_id as organizationId"
		)
		res.json(tickets)
	}	
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		const id = await db("tickets").insert({
			name: body.name,
			description: body.description,
			priority_id: body.priority_id,
			status_id: body.status_id,
			ticket_type_id: body.ticket_type_id,
			organization_id: body.organization_id
		}, ["id"])
		res.json({id: id[0], message: "Ticket inserted successfully!"})
	}	
	catch (err) {
		console.error(`Error while creating ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/user", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const assignedUsers = await db("tickets_to_users")
		.join("users", "users.id", "=", "tickets_to_users.user_id")
		.where("ticket_id", req.params.ticketId).select(
			"users.id",
			"users.first_name",
			"users.last_name",
			"users.email"
		)
		res.json(assignedUsers)
	}	
	catch (err){
		console.log(`Error while getting assigned users for ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/user/:userId", validateTicketUserGet, handleValidationResult, async (req, res, next) => {
	try {
		const assignedUser = await db("tickets_to_users")
		.join("users", "users.id", "=", "tickets_to_users.user_id")
		.where("ticket_id", req.params.ticketId)
		.where("user_id", req.params.userId)
		.select(
			"users.id",
			"users.first_name",
			"users.last_name",
			"users.email",
		).first()
		res.json(assignedUser)
	}	
	catch (err) {
		console.log(`Error while getting assigned user for ticket: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/user/", validateTicketUserCreate, handleValidationResult, async (req, res, next) => {
	try {
		const users = req.body.user_ids
		const ticketId = req.params.ticketId
		await db("tickets_to_users").insert(users.map((userId) => ({user_id: userId , ticket_id: ticketId})))
		res.json({message: "users assigned to tickets successfully!"})
	}	
	catch (err) {
		console.log(`Error while inserting tickets into board: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/user/:userId", validateTicketUserGet, handleValidationResult, async (req, res, next) => {
	try {
		const assignedUser = await db("tickets_to_users")
		.where("ticket_id", req.params.ticketId)
		.where("user_id", req.params.userId)
		.del()
		res.json({"message": "user unassigned from ticket successfully!"})
	}	
	catch (err) {
		console.log(`Error while getting assigned user for ticket: ${err.message}`)
		next(err)
	}
})


router.put("/:ticketId", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").where("id", req.params.ticketId).update({
			name: req.body.name,
			description: req.body.description,
			priority_id: req.body.priority_id,
			status_id: req.body.status_id,
			ticket_type_id: req.body.ticket_type_id
		})
		res.json({message: "Ticket updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId", validateDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").where("id", req.params.ticketId).del()
		res.json({message: "Ticket deleted successfully!"})
	}
	catch (err){
		console.log(`Error while deleting ticket: ${err.message}`)
		next(err)
	}
})

module.exports = router
