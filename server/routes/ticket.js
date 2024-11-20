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
		const epicTicketType = await db("ticket_types").where("name", "Epic").first()
		const epicTicketRelationshipType = await db("ticket_relationship_types").where("name", "Epic").first()
		let tickets = db("tickets").where("organization_id", req.user.organization).select(
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
			if (req.query.board){
				queryBuilder.join("tickets_to_boards", "tickets_to_boards.ticket_id", "=", "tickets.id").where("tickets_to_boards.board_id", "=", req.query.board)
			}
			if (req.query.ticketIds){
				queryBuilder.whereIn("id", req.query.ticketIds.split(","))
			}
			if (req.query.childTicketId){
				if (req.query.excludeAddedEpicParent){
					queryBuilder.whereNotIn("tickets.id", 
						db("ticket_relationships").where("child_ticket_id", req.query.childTicketId).where("ticket_relationship_type_id", epicTicketRelationshipType?.id).select("ticket_relationships.parent_ticket_id")
					)
				}
			}
			if (req.query.parentTicketId && req.query.isLinkableTicket){
				// the current ticket id being passed in cannot be the parent or the child of another ticket to be considered linkable
				if (!req.query.isEpicParent){
					// should not contain tickets where the current ticket is a parent
					queryBuilder.whereNotIn("tickets.id", db("ticket_relationships").where("parent_ticket_id", req.query.parentTicketId).select("ticket_relationships.child_ticket_id"))
					// should not contain tickets where the current ticket is a child 
					.whereNotIn("tickets.id", db("ticket_relationships").where("child_ticket_id", req.query.parentTicketId).select("ticket_relationships.parent_ticket_id"))
					// ticket cannot be linked to itself
					.whereNot("tickets.id", req.query.parentTicketId)
					// ticket cannot be an epic
					.whereNot("tickets.ticket_type_id", epicTicketType?.id)
				}
				else {
					// should not contain tickets where the current ticket is a parent and the ticket relationship type is an epic
					queryBuilder.whereNotIn("tickets.id", db("ticket_relationships").where("parent_ticket_id", req.query.parentTicketId).where("ticket_relationship_type_id", epicTicketRelationshipType?.id).select("ticket_relationships.child_ticket_id"))
					// ticket cannot be linked to itself
					.whereNot("tickets.id", req.query.parentTicketId)
					// ticket cannot be an epic
					.whereNot("tickets.ticket_type_id", epicTicketType?.id)
				}
			}
			if (req.query.assignedToUser){
				queryBuilder.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets.id")
				.join("users", "tickets_to_users.user_id", "=", "users.id")
				.where("users.id", req.query.assignedToUser)
				.where("tickets_to_users.is_watcher", false)
			}
			if (req.query.sortBy && req.query.order){
				if (req.query.sortBy === "createdAt"){
					queryBuilder.orderBy("tickets.created_at", req.query.order)
				}	
			}
		})
		// hack to keep the tickets paginate data format into {data, pagination},
		// which finds the total amount of data and 
		// loads all data into one page. Should prioritize using pagination when possible.
		if (req.query.skipPaginate){
			const ticketsForAmt = await tickets
			const total = ticketsForAmt.length
			tickets = await tickets.paginate({ perPage: total, currentPage: 1, isLengthAware: true})
		}
		else {
			tickets = await tickets.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		}
		res.json(tickets)
	}
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.get("/:ticketId", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		let tickets = await db("tickets").where("id", req.params.ticketId).select(
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
		const epicTicketType = await db("ticket_types").where("name", "Epic").first()
		const epicTicketRelationshipType = await db("ticket_relationship_types").where("name", "Epic").first()
		if (tickets?.length){
			let epicParentTickets = []
			let ticket = tickets[0]
			// include any epics that this child ticket is attached to
			if (ticket.ticketTypeId !== epicTicketType?.id){
				epicParentTickets = await db("ticket_relationships")
				.where("child_ticket_id", ticket.id)
				.where("ticket_relationship_type_id", epicTicketRelationshipType?.id)
				.join("tickets", "tickets.id", "=", "ticket_relationships.parent_ticket_id")
				.select(
					"tickets.id as id",
					"tickets.name as name"
				)
			}
			tickets = [{...ticket, epicParentTickets: epicParentTickets}]
		}
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
		const users = await db("tickets_to_users")
		.join("users", "users.id", "=", "tickets_to_users.user_id")
		.where("ticket_id", req.params.ticketId).select(
			"users.id",
			"users.first_name as firstName",
			"users.last_name as lastName",
			"users.email"
		).modify((queryBuilder) => {
			if (req.query.isWatcher === "false"){
				queryBuilder.where("is_watcher", false)
			}
		})
		res.json(users)
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
		const userIds = req.body.user_ids
		const isWatcher = req.body.is_watcher
		const ticketId = req.params.ticketId
		await db("tickets_to_users").insert([{user_id: userIds[0], ticket_id: ticketId, is_watcher: isWatcher}])
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
		// delete all users attached to this ticket and then re-insert
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
		.where("is_watcher", true)
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
		.paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
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
		const epicTicketRelationshipType = await db("ticket_relationship_types").where("name", "Epic").first()
		const isCompletedStatuses = await db("statuses").where("is_completed", true)
		const relationships = await db("ticket_relationships")
		.modify((queryBuilder) => {
			if (req.query.isEpic === "true"){
				queryBuilder.where("ticket_relationship_type_id", epicTicketRelationshipType?.id)
				.where("parent_ticket_id", req.params.ticketId)
			}
			else {
				queryBuilder.where("ticket_relationship_type_id", "!=", epicTicketRelationshipType?.id)
				.where((queryBuilder) => queryBuilder.where("child_ticket_id", req.params.ticketId).orWhere("parent_ticket_id", req.params.ticketId))
			}
		})
		.select(
			"id as id", 
			"parent_ticket_id as parentTicketId",
			"child_ticket_id as childTicketId",
			"ticket_relationship_type_id as ticketRelationshipTypeId",
		).paginate({ perPage: 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		let total = relationships.pagination.total
		let completedTickets = []
		if (req.query.includeEpicPercentageCompletion){
			// find amount of completed tasks
			completedTickets = await db("ticket_relationships").join("tickets", "ticket_relationships.child_ticket_id", "=", "tickets.id").where("ticket_relationship_type_id", epicTicketRelationshipType?.id)
			.where("parent_ticket_id", req.params.ticketId).whereIn("tickets.status_id", isCompletedStatuses.map((status)=>status.id))
		}
		res.json({
			...relationships, 
			additional: {
				...(req.query.includeEpicPercentageCompletion ? {percentageCompleted: (completedTickets.length/total) * 100} : {})	
			}
		})	
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
