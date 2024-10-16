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
	validateTicketStatusUpdate,
	validateTicketRelationshipGet,
	validateTicketRelationshipCreate,
	validateTicketRelationshipDelete,

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
			"tickets.organization_id as organizationId",
			"tickets.created_at as createdAt",
			"tickets.user_id as userId",
		).modify((queryBuilder) => {
			if (req.query.searchBy === "title"){
				queryBuilder.whereILike("name", `%${req.query.query}%`)
			}
			else if (req.query.searchBy === "assignee"){
				queryBuilder.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets.id")
				.join("users", "tickets_to_users.user_id", "=", "users.id")
				.whereILike("users.first_name", `%${req.query.query}%`)
			}
			else if (req.query.searchBy === "reporter"){
				queryBuilder.join("users", "users.id", "=", "tickets.user_id").whereILike("users.first_name", `%${req.query.query}%`)
			}

			if (req.query.ticketType) {
				queryBuilder.where("tickets.ticket_type_id", req.query.ticketType)
			}
			if (req.query.priority){
				queryBuilder.where("tickets.priority_id", req.query.priority)
			}
		})
		.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
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
			"tickets.organization_id as organizationId",
			"tickets.created_at as createdAt",
			"tickets.user_id as userId",
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
		const comments = await db("ticket_comments").where("ticket_id", req.params.ticketId).orderBy(
			"created_at", "desc"
		).select(
			"id as id",
			"user_id as userId",
			"ticket_id as ticketId",
			"comment as comment",
			"created_at as createdAt"
		)
		res.json(comments)
	}	
	catch (err) {
		console.log(`Error while getting comments for ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/comment/:commentId", validateTicketCommentGet, handleValidationResult, async (req, res, next) => {
	try {
		const comment = await db("ticket_comments").where("id", req.params.id).select(
			"id as id",
			"user_id as userId",
			"ticket_id as ticketId",
			"comment as comment",
			"created_at as createdAt"
		)
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

router.get("/:ticketId/relationship", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const relationships = await db("ticket_relationships").where("parent_ticket_id", req.params.ticketId).orWhere("child_ticket_id", req.params.ticketId)
		.select(
			"id as id", 
			"parent_ticket_id as parentTicketId",
			"child_ticket_id as childTicketId",
			"ticket_relationship_type_id as ticketRelationshipTypeId",
		)
		res.json(relationships)
	}	
	catch (err) {
		console.log(`Error while getting ticket relationships: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/relationship/:relationshipId", validateTicketRelationshipGet, handleValidationResult, async (req, res, next) => {
	try {
		const relationship = await db("ticket_relationships").where("id", req.params.relationshipId).select(
			"id as id", 
			"parent_ticket_id as parentTicketId",
			"child_ticket_id as childTicketId",
			"ticket_relationship_type_id as ticketRelationshipTypeId",
		)
		res.json(relationship)
	}	
	catch (err) {
		console.log(`Error while getting ticket relationship: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/relationship", validateTicketRelationshipCreate, handleValidationResult, async (req, res, next) => {
	try {
		const id = await db("ticket_relationships").insert([{
			parent_ticket_id: req.params.ticketId,
			child_ticket_id: req.body.child_ticket_id,
			ticket_relationship_type_id: req.body.ticket_relationship_type_id
		}], ["id"])
		res.json({id: id[0], message: "Ticket relationship inserted successfully!"})
	}	
	catch (err){
		console.log(`Error while creating ticket relationship: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/relationship/:relationshipId", validateTicketRelationshipDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_relationships").where("id", req.params.relationshipId).del()
		res.json({message: "ticket relationship deleted successfully!"})
	}	
	catch (err) {
		console.log(`Error while deleting ticket relationship: ${err.message}`)
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

router.patch("/:ticketId/status", validateTicketStatusUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").where("id", req.params.ticketId).update({
			status_id: req.body.status_id
		})
		res.json({message: `Ticket status updated successfully!`})
	}
	catch (err) {
		console.error(`Error while updating ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId", validateDelete, handleValidationResult, async (req, res, next) => {
	try {
		// check if ticket exists on any boards and remove them from the boards first
		const ticketsToBoards = await db("tickets_to_boards").where("ticket_id", req.params.ticketId)
		if (ticketsToBoards.length){
			await db("tickets_to_boards").where("ticket_id", req.params.ticketId).del()
		}

		// check if ticket exists in any ticket relationships and delete these relationships
		const ticketRelationships = await db("ticket_relationships").where("parent_ticket_id", req.params.ticketId).orWhere("child_ticket_id", req.params.ticketId)
		if (ticketRelationships.length){
			await db("ticket_relationships").whereIn("id", ticketRelationships.map((relationship) => relationship.id)).del()
		}
		// delete ticket
		await db("tickets").where("id", req.params.ticketId).del()
		res.json({message: "Ticket deleted successfully!"})
	}
	catch (err){
		console.log(`Error while deleting ticket: ${err.message}`)
		next(err)
	}
})

module.exports = router
