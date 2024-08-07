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
	validateTicketUserBulkEdit,
	validateTicketCommentGet,
	validateTicketCommentCreate,
	validateTicketCommentUpdate,
	validateTicketCommentDelete,

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
			organization_id: body.organization_id,
			user_id: req.user.id
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
			"users.first_name as firstName",
			"users.last_name as lastName",
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
			"users.first_name as firstName",
			"users.last_name as lastName",
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
		console.log(`Error while assigning user to ticket: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/user/bulk-edit", validateTicketUserBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const userIds = req.body.user_ids
		const ticketId = req.params.ticketId
		// delete all status ids attached to this board and then re-insert
		const toInsert = userIds.map((id) => ({ticket_id: ticketId, user_id: id}))
		await db("tickets_to_users").where("ticket_id", ticketId).delete()
		await db("tickets_to_users").insert(toInsert)
		res.json({message: "users assigned to ticket successfully!"})
	}	
	catch (err){ 
		console.log(`Error while assigning users to ticket: ${err.message}`)
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

router.get("/:ticketId/comment", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const comments = await db("ticket_comments").where("ticket_id", req.params.ticketId)
		res.json(comments)
	}	
	catch (err) {
		console.log(`Error while getting comments for ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/comment/:commentId", validateTicketCommentGet, handleValidationResult, async (req, res, next) => {
	try {
		const comment = await db("ticket_comments").where("id", req.params.id)
		req.json(comment)
	}	
	catch (err) {
		console.log(`Error while getting comment for ticket: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/comment", validateTicketCommentCreate, handleValidationResult, async (req, res, next) => {
	try {
		const id = await db("ticket_comments").insert({
			comment: req.body.comment,
			ticket_id: req.params.ticketId,
			user_id: req.user.id
		}, ["id"])
		res.json({id: id[0], message: "Comment inserted successfully!"})
	}
	catch (err){
		console.log(`Error while creating comment for ticket: ${err.message}`)
		next(err)
	}
})

router.put("/:ticketId/comment/:commentId", validateTicketCommentUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_comments").where("id", req.params.commentId).update(
		{
			comment: req.body.comment
		})	
		res.json({message: "Comment updated successfully!"})
	}	
	catch (err) {
		console.log(`Error while updating comment: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/comment/:commentId", validateTicketCommentDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_comments").where("id", req.params.commentId).del()
		res.json({message: "Comment deleted successfully!"})
	}	
	catch (err){
		console.log(`Error while deleting comment: ${err.message}`)
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
