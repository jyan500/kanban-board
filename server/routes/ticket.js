const express = require("express")
const router = express.Router()
const { 
	validateGet,
	validateCreate, 
	validateUpdate, 
	validateDelete,
	validateBulkEdit,
	validateBulkWatch,
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
	validateTicketActivityAdd,
	validateTicketActivityGet,
	validateTicketActivityUpdate,
	validateTicketActivityDelete,

}  = require("../validation/ticket")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { retryTransaction, parseMentions, insertAndGetId } = require("../helpers/functions")
const db = require("../db/db")
const { DEFAULT_PER_PAGE } = require("../constants")
const { GoogleGenAI } = require("@google/genai")
const { searchTicketByAssignee } = require("../helpers/query-helpers")
const { rateLimitTicketSummary } = require("../middleware/rateLimitMiddleware")

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
			"tickets.story_points as storyPoints",
			"tickets.due_date as dueDate",
			"tickets.organization_id as organizationId",
			"tickets.created_at as createdAt",
			"tickets.user_id as userId",
		).modify((queryBuilder) => {
			if (req.query.searchBy === "title"){
				queryBuilder.whereILike("name", `%${req.query.query}%`)
			}
			else if (req.query.searchBy === "assignee"){
				searchTicketByAssignee(queryBuilder, req.query.query)
			}
			else if (req.query.searchBy === "reporter"){
				queryBuilder.join("users", "users.id", "=", "tickets.user_id").whereILike("users.first_name", `%${req.query.query}%`)
			}
			if (req.query.ticketType || req.query.ticketTypeId) {
				queryBuilder.where("tickets.ticket_type_id", req.query.ticketType ?? req.query.ticketTypeId)
			}
			if (req.query.priority || req.query.priorityId){
				queryBuilder.where("tickets.priority_id", req.query.priority ?? req.query.priorityId)
			}
			if (req.query.board || req.query.boardId){
				queryBuilder.join("tickets_to_boards", "tickets_to_boards.ticket_id", "=", "tickets.id").where("tickets_to_boards.board_id", "=", req.query.board ?? req.query.boardId)
			}
			if (req.query.status || req.query.statusId){
				queryBuilder.where("tickets.status_id", req.query.status ?? req.query.statusId)
			}
			if (req.query.sprintId){
				queryBuilder.join("tickets_to_sprints", "tickets_to_sprints.ticket_id", "=", "tickets.id").where("tickets_to_sprints.sprint_id", req.query.sprintId)
			}
			if ("ticketIds" in req.query){
				queryBuilder.whereIn("id", req.query.ticketIds.split(","))
			}
			if ("statusIds" in req.query){
				queryBuilder.whereIn("status_id", req.query.statusIds.split(","))
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
				// if req.query.isWatching, only get the tickets that the user is watching
				.where("tickets_to_users.is_watcher", req.query.isWatching == "true" ? true : false)
				.where("tickets_to_users.is_mention", false)
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
			tickets = await tickets.paginate({ perPage: req.query.perPage ?? DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		}
		if (req.query.includeAssignees){
			tickets = {...tickets, data: await Promise.all(
				tickets.data.map(async (ticket) => {
					const assignees = await db("tickets_to_users").join("users", "users.id", "=", "tickets_to_users.user_id").where("ticket_id", ticket.id).where("is_watcher", false).where("is_mention", false).select(
						"users.id as id",
						"users.first_name as firstName",
						"users.last_name as lastName",
					)
					return {
						...ticket,
						assignees: assignees.map((assignee) => ({
							id: assignee.id,
							firstName: assignee.firstName,
							lastName: assignee.lastName
						}))
					}					
				})
			)}
		}
		if (req.query.includeTimeSpent){
			tickets = {...tickets, data: await Promise.all(
				tickets.data.map(async (ticket) => {
					const timeSpent = await db("ticket_activity").where("ticket_id", ticket.id).sum("minutes_spent as timeSpent").first()
					return {
						...ticket,
						timeSpent: timeSpent
					}					
				})
			)}
		}
		res.json(tickets)
	}
	catch (err) {
		console.error(`Error while getting tickets: ${err.message}`)	
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
			"tickets.due_date as dueDate",
			"tickets.story_points as storyPoints",
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
		console.error(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.post("/bulk-edit", validateBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const updateBody = {
			...(req.body.status_id ? {status_id: req.body.status_id} : {}),
			...(req.body.priority_id ? {priority_id: req.body.priority_id} : {})
		}
		if (Object.keys(updateBody).length){
			await db("tickets").whereIn("id", req.body.ticket_ids).update(updateBody)
		}
		// re-assign user
		if (req.body.user_ids.length){
			const ticketUserBody = req.body.ticket_ids.map((id) => ({
				ticket_id: id,
				user_id: req.body.user_ids[0]
			}))
			// delete all existing assignees
			await db("tickets_to_users").where("is_watcher", false).where("is_mention", false).whereIn("ticket_id", req.body.ticket_ids).del()
			// re-insert new assignee for each ticket
			await db("tickets_to_users").insert(ticketUserBody)
		}
		res.json({message: "Tickets updated successfully!"})
	}	
	catch (err) {
		console.error(`Error while updating ticket: ${err.message}`)	
		next(err)
	}
})

router.post("/bulk-watch", validateBulkWatch, handleValidationResult, async (req, res, next) => {
	try {
		if (req.body.to_add){
			let ticketIdsToWatch = await Promise.all(req.body.ticket_ids.map(async (id) => {
				// if the user is not a watcher for this ticket, add them to a list of ticket ids
				const watcher = await db("tickets_to_users").where("ticket_id", id).where("user_id", req.body.user_id).where("is_watcher", true).where("is_mention", false).first()
				if (!watcher){
					return id
				}
			}))
			// filter out null values
			const body = ticketIdsToWatch.filter((id) => id).map((id) => ({
				ticket_id: id,
				user_id: req.body.user_id,
				is_watcher: true
			}))
			await db("tickets_to_users").insert(body)
			res.json({message: "Watcher has been added to tickets successfully!"})
		}
		else {
			let ticketsToUsersIds = await Promise.all(req.body.ticket_ids.map(async (id) => {
				const watcher = await db("tickets_to_users").where("ticket_id", id).where("user_id", req.body.user_id).where("is_watcher", true).where("is_mention", false).first()	
				if (watcher){
					return watcher.id
				}
			}))
			// delete all the ticket to users rows where the user is a watcher
			await db("tickets_to_users").whereIn("id", ticketsToUsersIds.filter(id => id)).del()
			res.json({message: "Watcher has been removed from tickets successfully!"})
		}
	}	
	catch (err){
		console.error(`Error while editing watchers on ticket: ${err.message}`)	
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		const id = await insertAndGetId("tickets", {
			name: body.name,
			description: body.description,
			priority_id: body.priority_id,
			status_id: body.status_id,
			ticket_type_id: body.ticket_type_id,
			organization_id: body.organization_id,
			user_id: req.user.id
		})
		const ticketsToUsers = await parseMentions(req.body.description, {ticket_id: id, is_mention: true}, req.user.organization)
		if (ticketsToUsers.length){
			await db("tickets_to_users").insert(ticketsToUsers)
		}
		res.json({id: id, mentions: ticketsToUsers.map((obj) => {
			return {
				userId: obj.user_id,
				ticketId: obj.ticket_id,
			}
		}), message: "Ticket inserted successfully!"})
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
			"users.image_url as imageUrl",
			"users.email"
		).modify((queryBuilder) => {
			if (req.query.isWatcher === "false"){
				queryBuilder.where("is_watcher", false)
			}
			if (req.query.isWatcher === "true"){
				queryBuilder.where("is_watcher", true)
			}
			if (req.query.isMention === "false"){
				queryBuilder.where("is_mention", false)
			}
			if (req.query.isMention === "true"){
				queryBuilder.where("is_mention", true)
			}
		})
		res.json(users)
	}	
	catch (err){
		console.error(`Error while getting assigned users for ticket: ${err.message}`)
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
			"users.image_url as imageUrl",
			"users.email",
		).first()
		res.json(assignedUser)
	}	
	catch (err) {
		console.error(`Error while getting assigned user for ticket: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/user/", validateTicketUserCreate, handleValidationResult, async (req, res, next) => {
	try {
		const userIds = req.body.user_ids
		const isWatcher = req.body.is_watcher
		const ticketId = req.params.ticketId

		const existingUsers = await db("tickets_to_users").where("ticket_id", ticketId).where("is_watcher", isWatcher)
		const existingUserIds = existingUsers.map((ticketToUser) => ticketToUser.user_id)
		const toAdd = userIds.filter((id) => !existingUserIds.includes(id))
		const toDelete = existingUserIds.filter((id) => !userIds.includes(id))

		// add any assigned users that are present in the new list of ids but not present in the existing list
		if (toAdd.length){
			await db("tickets_to_users").insert(toAdd.map((id) => {
				return {
					user_id: id,
					is_watcher: isWatcher,
					ticket_id: ticketId
				}
			}))
		}
		// delete any assigned users that are present in the existing ids but not in the new list of ids
		if (toDelete.length){
			await db("tickets_to_users").where("ticket_id", ticketId).whereIn("user_id", toDelete).del()
		}

		res.json({message: "users assigned to tickets successfully!"})
	}	
	catch (err) {
		console.error(`Error while assigning user to ticket: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/user/bulk-edit", validateTicketUserBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const userIds = req.body.user_ids
		const ticketId = req.params.ticketId
		// delete all users attached to this ticket and then re-insert
		const toInsert = userIds.map((id) => ({ticket_id: ticketId, user_id: id}))
		await db("tickets_to_users").where("ticket_id", ticketId).where("is_mention", false).where("is_watcher", false).delete()
		await db("tickets_to_users").insert(toInsert)
		res.json({message: "users assigned to ticket successfully!"})
	}	
	catch (err){ 
		console.error(`Error while assigning users to ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/user/:userId", validateTicketUserGet, handleValidationResult, async (req, res, next) => {
	try {
		const assignedUser = await db("tickets_to_users")
		.where("ticket_id", req.params.ticketId)
		.where("user_id", req.params.userId)
		.where("is_watcher", true)
		.where("is_mention", false)
		.del()
		res.json({"message": "user unassigned from ticket successfully!"})
	}	
	catch (err) {
		console.error(`Error while getting assigned user for ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/comment", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const comments = await db("ticket_comments").where("ticket_id", req.params.ticketId).orderBy(
			"created_at", "desc"
		).select(
			"ticket_comments.id as id",
			"user_id as userId",
			"ticket_id as ticketId",
			"comment as comment",
			"created_at as createdAt"
		)
		.paginate({ perPage: req.query.perPage ?? DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		Promise.all(comments.data.map(async (comment) => {
			const user = await db("users").where("users.id", comment.userId).select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.image_url as imageUrl",
				"users.email as email").first()
			return {
				...comment,
				user: user
			}
		})).then((commentsWithUsers) => {
			res.json({
				data: commentsWithUsers,
				pagination: comments.pagination
			})
		})
	}	
	catch (err) {
		console.error(`Error while getting comments for ticket: ${err.message}`)
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
		console.error(`Error while getting comment for ticket: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/comment", validateTicketCommentCreate, handleValidationResult, async (req, res, next) => {
	try {
		const id = await insertAndGetId("ticket_comments", {
			comment: req.body.comment,
			ticket_id: req.params.ticketId,
			user_id: req.user.id
		})
		const ticketCommentsToUsers = await parseMentions(req.body.comment, {ticket_comment_id: id}, req.user.organization)
		if (ticketCommentsToUsers.length){
			await db("ticket_comments_to_users").insert(ticketCommentsToUsers)
		}
		res.json({id: id, mentions: ticketCommentsToUsers.map((obj) => {
			return {
				ticketCommentId: obj.ticket_comment_id,
				userId: obj.user_id,
			}
		}), message: "Comment inserted successfully!"})
	}
	catch (err){
		console.error(`Error while creating comment for ticket: ${err.message}`)
		next(err)
	}
})

router.put("/:ticketId/comment/:commentId", validateTicketCommentUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_comments").where("id", req.params.commentId).update(
		{
			comment: req.body.comment
		})	
		const ticketCommentsToUsers = await parseMentions(req.body.comment, {ticket_comment_id: req.params.commentId}, req.user.organization)
		let newMentions = []
		if (ticketCommentsToUsers.length){
			newMentions = await Promise.all(ticketCommentsToUsers.map(async (obj) => {
				// if the mention doesn't exist, track these to create notifications for them in a separate request
				const mention = await db("ticket_comments_to_users").where("ticket_comment_id", req.params.commentId).where("user_id", obj.user_id).first()
				if (!mention){
					return obj
				}
			}))
			// delete existing mentions before inserting new ones
			await db("ticket_comments_to_users").where("ticket_comment_id", req.params.commentId).del()
			await db("ticket_comments_to_users").insert(ticketCommentsToUsers)
		}
		else {
			// assuming the user erased all the mentions from the text body before submitting,
			// we can delete all ticket comment mentions
			await db("ticket_comments_to_users").where("ticket_comment_id", req.params.commentId).del()
		}
		// make sure to remove any undefined instances in the case we're editing a comment with an existing mention
		// and no new mentions are added
		res.json({mentions: newMentions.filter((obj) => obj).map((obj) => {
			return {
				ticketCommentId: obj.ticket_comment_id,
				userId: obj.user_id,
			}
		}), message: "Comment updated successfully!"})
	}	
	catch (err) {
		console.error(`Error while updating comment: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/comment/:commentId", validateTicketCommentDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_comments").where("id", req.params.commentId).del()
		res.json({message: "Comment deleted successfully!"})
	}	
	catch (err){
		console.error(`Error while deleting comment: ${err.message}`)
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
		).paginate({ perPage: DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
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
		console.error(`Error while getting ticket relationships: ${err.message}`)
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
		console.error(`Error while getting ticket relationship: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/relationship", validateTicketRelationshipCreate, handleValidationResult, async (req, res, next) => {
	try {
		const id = await insertAndGetId("ticket_relationships", {
			parent_ticket_id: req.params.ticketId,
			child_ticket_id: req.body.child_ticket_id,
			ticket_relationship_type_id: req.body.ticket_relationship_type_id
		})
		res.json({id: id, message: "Ticket relationship inserted successfully!"})
	}	
	catch (err){
		console.error(`Error while creating ticket relationship: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/relationship/:relationshipId", validateTicketRelationshipDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_relationships").where("id", req.params.relationshipId).del()
		res.json({message: "ticket relationship deleted successfully!"})
	}	
	catch (err) {
		console.error(`Error while deleting ticket relationship: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/activity", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		let ticketActivities = await db("ticket_activity").where("ticket_id", req.params.ticketId).orderBy("created_at", "desc").select(
			"id as id",
			"description as description",
			"ticket_id as ticketId",
			"user_id as userId",
			"minutes_spent as minutesSpent",
			"created_at as createdAt"
		).paginate({ perPage: req.query.perPage ?? DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		Promise.all(ticketActivities.data.map(async (ticketActivity) => {
			const user = await db("users").where("users.id", ticketActivity.userId).select(
				"users.id as id", 
				"users.first_name as firstName", 
				"users.last_name as lastName", 
				"users.image_url as imageUrl",
				"users.email as email").first()
			return {
				...ticketActivity,
				user: user
			}
		})).then(async (activitiesWithUsers) => {
			let totalMinutes = 0
			if (req.query.includeTotalTime){
				totalMinutes = await db("ticket_activity").where("ticket_id", req.params.ticketId).sum("minutes_spent as totalMinutesSpent").first()
			}
			res.json({
				data: activitiesWithUsers,
				pagination: ticketActivities.pagination,
				...(req.query.includeTotalTime ? {additional: {totalTime: totalMinutes?.totalMinutesSpent ?? 0}} : {})
			})
		})
	}
	catch (err) {
		console.error(`Error while getting ticket activity: ${err.message}`)
		next(err)
	}
})

router.post("/:ticketId/activity", validateTicketActivityAdd, handleValidationResult, async (req, res, next) => {
	try {
		const { description, minutes_spent, user_id } = req.body
		await db("ticket_activity").insert({
			ticket_id: req.params.ticketId,
			description,
			minutes_spent,
			user_id: req.user.id
		})
		res.json({message: "ticket activity created successfully!"})
	}
	catch (err) {
		console.error(`Error while adding ticket activity: ${err.message}`)
		next(err)
	}
})

router.get("/:ticketId/activity/:activityId", validateTicketActivityGet, handleValidationResult, async (req, res, next) => {
	try {
		let ticketActivity = await db("ticket_activity").where("id", req.params.activityId).select(
			"id as id",
			"description as description",
			"ticket_id as ticketId",
			"user_id as userId",
			"minutes_spent as minutesSpent",
			"created_at as createdAt"
		).first()
		res.json(ticketActivity)
	}
	catch (err) {
		console.error(`Error while getting ticket activity: ${err.message}`)
		next(err)
	}
})

router.put("/:ticketId/activity/:activityId", validateTicketActivityUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const { description, minutes_spent } = req.body
		await db("ticket_activity").where("id", req.params.activityId).update({
			description, 
			minutes_spent,
		})
		res.json({message: "Ticket activity updated successfully!"})
	}	
	catch (err){
		console.error(`Error while updatnig ticket activity: ${err.message}`)
		next(err)
	}
})

router.delete("/:ticketId/activity/:activityId", validateTicketActivityDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("ticket_activity").where("id", req.params.activityId).del()
		res.json({message: "Ticket activity deleted successfully!"})
	}
	catch (err) {
		console.error(`Error while deleting ticket activity: ${err.message}`)
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
			ticket_type_id: req.body.ticket_type_id,
			due_date: req.body.due_date !== "" ? new Date(req.body.due_date).toISOString().split('T')[0] : null,
			story_points: req.body.story_points,
		})
		// remove existing mentioned users first before adding
		const ticketsToUsers = await parseMentions(req.body.description, {ticket_id: req.params.ticketId, is_mention: true}, req.user.organization)
		let newMentions = []
		if (ticketsToUsers.length){
			newMentions = await Promise.all(ticketsToUsers.map(async (obj) => {
				const mention = await db("tickets_to_users").where("ticket_id", req.params.ticketId).where("user_id", obj.user_id).where("is_mention", true).first()
				// if the mention doesn't exist, track these to create notifications for them in a separate request
				if (!mention){
					return obj
				}
			}))
			await db("tickets_to_users").where("ticket_id", req.params.ticketId).where("is_mention", true).del()
			await db("tickets_to_users").insert(ticketsToUsers)
		}
		// if there are no mentioned users, it is assumed that the user has cleared these out 
		// in the text body, so delete existing mentioned users
		else {
			await db("tickets_to_users").where("ticket_id", req.params.ticketId).where("is_mention", true).del()
		}
		res.json({mentions: newMentions.filter((obj) => obj).map((obj) => {
			return {
				userId: obj.user_id,
				ticketId: obj.ticket_id,
			}
		}), message: "Ticket updated successfully!"})
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

/* 
Generates smart-summary of a ticket by concatenating all text content + ticket activity, and inputting
into LLM model. 
*/
router.get("/:ticketId/summary", rateLimitTicketSummary, validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const ai = new GoogleGenAI({})
		const ticket = await db("tickets").where("id", req.params.ticketId).first()
		const ticketComments = await db("ticket_comments").where("ticket_id", req.params.ticketId)
		const status = await db("statuses").where("id", ticket.status_id).first()
		const ticketAssignees = await db("tickets_to_users").where("ticket_id", req.params.ticketId).join("users", "users.id", "=", "tickets_to_users.user_id").select(
			"users.first_name as firstName", "users.last_name as lastName"
		)
		const commenters = await db("ticket_comments").where("ticket_id", req.params.ticketId)
		.join("ticket_comments_to_users", "ticket_comments_to_users.ticket_comment_id", "=", "ticket_comments.id")
		.join("users", "users.id", "=", "ticket_comments_to_users.user_id")
		.select("users.first_name as firstName", "users.last_name as lastName")

		const pointsOfContact = [...ticketAssignees, ...commenters]

		const prompt = `
			You are an assistant helping a project manager understand the progress of a software development task.

			Title: ${ticket.name}
			Description: ${ticket.description}

			Latest Comments:
			${ticketComments.map((comment, i) => `(${i+1}) ${comment.comment} Timestamp: ${new Date(comment.updatedAt)}`).join('\n')}

			Status: ${status?.name ?? ""}

			Points of Contact: ${pointsOfContact.map((user, i) => `(${i+1}) ${user.firstName} ${user.lastName}`).join("\n")}

			Last Updated: ${new Date(ticket.updatedAt)}

			Generate a concise 2-3 sentence summary of this task. Include current progress, blockers (if any), points of contact, and next steps.
			The status of the ticket listed next to "Status: " above should take precedence over any statuses mentioned in the "Latest Comments: ".

			Please take into account the order of the comments based on timestamp as well as when the ticket is last updated.
		`
		const response = await ai.models.generateContent({
			model: process.env.GEMINI_MODEL,
			contents: prompt 
		})
		res.json({message: response.text, timestamp: new Date()})
	}
	catch (err){
		console.error(`Error while generating ticket summary: ${err.message}`)
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
		console.error(`Error while deleting ticket: ${err.message}`)
		next(err)
	}
})

module.exports = router
