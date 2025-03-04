const express = require("express")
const router = express.Router()
const { 
	validateGet, 
	validateCreate, 
	validateUpdate, 
	validateDelete,
	validateBoardTicketGet,
	validateBoardTicketCreate,
	validateBoardTicketDelete,
	validateBoardStatusGet,
	validateBoardStatusCreate,
	validateBoardStatusUpdate,
	validateBoardStatusDelete,
	validateBoardStatusBulkEdit,
}  = require("../validation/board")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")
const { mapIdToRowAggregateArray, mapIdToRowAggregateObjArray, mapIdToRowObject } = require("../helpers/functions") 

router.get("/", async (req, res, next) => {
	try {
		let resData;
		const boards = await db("boards").where("boards.organization_id", req.user.organization)
		.modify((queryBuilder) => {
			if (req.query.query){
				queryBuilder.whereILike("boards.name", `%${req.query.query}%`)
			}
			if (req.query.ignoreBoard){
				queryBuilder.whereNot("boards.id", req.query.ignoreBoard)
			}
			if (req.query.lastModified === "true"){
				queryBuilder.leftJoin("tickets_to_boards","tickets_to_boards.board_id", "=", "boards.id")
				.leftJoin("boards_to_statuses","boards_to_statuses.board_id", "=", "boards.id")
				.max("tickets_to_boards.updated_at as ticketsUpdatedAt")
				.max("boards_to_statuses.updated_at as boardStatusesUpdatedAt")
				.groupBy("boards.id")
				.select(
					"boards.updated_at as boardUpdatedAt",
				)
			}
			if (req.query.includeUserDashboardInfo){
				queryBuilder.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")	
				.join("tickets", "tickets.id", "=", "tickets_to_boards.ticket_id")
				.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets.id")
				.groupBy("tickets_to_users.user_id")
				.groupBy("boards.id")
				.where("tickets_to_users.user_id", "=", req.user.id)
			}
		})	
		.select(
			"boards.ticket_limit as ticketLimit", "boards.id as id", "boards.name as name", "boards.organization_id as organizationId"
		).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});

		let boardAssignees;
		let boardAssigneesRes = {}
		if (req.query.assignees === "true"){
			boardAssignees = await db("boards")
			.where("organization_id", req.user.organization)
			.whereIn("boards.id", boards.data.map((b) => b.id))
			.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")
			.join("tickets_to_users", "tickets_to_boards.ticket_id", "=", "tickets_to_users.ticket_id")
			.join("users", "tickets_to_users.user_id", "=", "users.id")
			.groupBy("boards.id")
			.groupBy("tickets_to_users.user_id")
			.select("boards.id as id", "tickets_to_users.user_id as userId", "users.first_name as firstName", "users.last_name as lastName")
			boardAssigneesRes = mapIdToRowAggregateObjArray(boardAssignees, ["userId", "firstName", "lastName"])
		}

		let numTickets;
		let numTicketsRes = {}
		if (req.query.numTickets === "true") {
			numTickets = await db("boards").where("organization_id", req.user.organization)
			.whereIn("boards.id", boards.data.map((b) => b.id))
			.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")
			.groupBy("tickets_to_boards.board_id")
			.count("tickets_to_boards.ticket_id as numTickets")
			.select("boards.id as id")
			numTicketsRes = mapIdToRowObject(numTickets)
		}

		let dashboardInfoMap = {}
		if (req.query.includeUserDashboardInfo === "true"){
			assignedTickets = await db("boards").where("boards.organization_id", req.user.organization).whereIn("boards.id", boards.data.map((b) => b.id))
			.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")
			.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets_to_boards.ticket_id")
			.join("tickets", "tickets_to_boards.ticket_id", "=", "tickets.id")
			.leftJoin("ticket_activity", "tickets_to_boards.ticket_id", "=", "ticket_activity.ticket_id")
			.sum("ticket_activity.minutes_spent as minutesSpent")
			.groupBy("tickets.id")
			.where("tickets_to_users.user_id", "=", req.user.id)
			.where("tickets_to_users.is_watcher", false)
			.where("tickets_to_users.is_mention", false)
			.select(
				"boards.id as id",
				"tickets.id as ticketId",
				"tickets.status_id as statusId",
			)
			/* 
				map the board id to the ticket information
				'13': [ { ticketId: 198, statusId: 8, minutesSpent: null }, { ticketId: 188, statusId: 7, minutesSpent: 360 } ],
				'14': [ { ticketId: 181, statusId: 7, minutesSpent: null }, { ticketId: 185, statusId: 7, minutesSpent: null } ]
			*/
			const boardsToAssignedTickets = mapIdToRowAggregateObjArray(assignedTickets, ["ticketId", "statusId", "minutesSpent"])
			const allIsCompleteStatuses = await db("statuses").where("is_completed", true).where("organization_id", req.user.organization)
			const statusIds = allIsCompleteStatuses.map((status) => status.id)
			Object.keys(boardsToAssignedTickets).forEach((boardId) => {
				const numTicketsCompletedByUser = boardsToAssignedTickets[boardId].filter((ticket) => statusIds.includes(ticket.statusId)).length
				const allTickets = boardsToAssignedTickets[boardId].length
				const percentComplete = Math.floor((numTicketsCompletedByUser/allTickets) * 100)
				const totalMinutesSpent = boardsToAssignedTickets[boardId].reduce((acc, obj) => {
					return acc + obj.minutesSpent
				}, 0)
				dashboardInfoMap[boardId] = {minutesSpent: totalMinutesSpent, percentComplete: percentComplete}
			})

		}

		if (req.query.lastModified === "true" || req.query.assignees === "true" || req.query.numTickets === "true" || req.query.includeUserDashboardInfo){
			resData = boards.data.map((board) => {
				let lastUpdated;
				if (req.query.lastModified === "true"){
					lastUpdated = new Date(Math.max(board.boardStatusesUpdatedAt, board.ticketsUpdatedAt, board.boardUpdatedAt))
				}
				let boardRes = {
					id: board.id,
					name: board.name,
					organizationId: board.organizationId,
					...(req.query.lastModified === "true" ? {lastModified: lastUpdated ?? null} : {})
				}
				if (req.query.includeUserDashboardInfo){
					boardRes = {...boardRes,
						percentComplete: dashboardInfoMap[board.id].percentComplete ?? 0,
						minutesSpent: dashboardInfoMap[board.id].minutesSpent ?? 0
					}
				}
				if (req.query.assignees === "true" && board.id in boardAssigneesRes){
					boardRes = {...boardRes, assignees: Object.keys(boardAssigneesRes).length > 0 ? boardAssigneesRes[board.id] : 0}
				}
				if (req.query.numTickets === "true" && board.id in numTicketsRes){
					boardRes = {...boardRes, numTickets: Object.keys(numTicketsRes).length > 0 ? numTicketsRes[board.id].numTickets : 0}
				}
				return boardRes
			})
			resData = {data: resData, pagination: boards.pagination}
		}
		else {
			resData = boards
		}
		res.json(resData)
	}
	catch (err) {
		console.log(`Error while getting boards: ${err.message}`)	
		next(err)
	}
})

router.get("/:boardId", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const boards = await db("boards").where("id", req.params.boardId).select(
			"boards.id as id",
			"boards.name as name",
			"boards.ticket_limit as ticketLimit",
			"boards.organization_id as organizationId",
		)
		let boardAssignees;
		let boardAssigneesRes = {}
		if (req.query.assignees === "true"){
			boardAssignees = await db("boards")
			.where("organization_id", req.user.organization)
			.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")
			.join("tickets_to_users", "tickets_to_boards.ticket_id", "=", "tickets_to_users.ticket_id")
			.groupBy("boards.id")
			.groupBy("tickets_to_users.user_id")
			.where("boards.id", req.params.boardId)
			.select("boards.id as id", "tickets_to_users.user_id")
			boardAssigneesRes = mapIdToRowAggregateArray(boardAssignees, "user_id")
		}
		const resData = boards.map((board) => {
			let boardRes = {
				id: board.id,
				name: board.name,
				organizationId: board.organizationId,
				ticketLimit: board.ticketLimit
			}
			if (req.query.assignees === "true" && board.id in boardAssigneesRes){
				boardRes = {...boardRes, assignees: Object.keys(boardAssigneesRes).length > 0 ? boardAssigneesRes[board.id] : 0}
			}	
			return boardRes
		})
		res.json(resData)
	}	
	catch (err) {
		console.log(`Error while getting Boards: ${err.message}`)	
		next(err)
	}
})

router.get("/:boardId/last-modified", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const boardLastUpdated = await db("boards").where("id", req.params.boardId).select(
			"boards.updated_at as updatedAt" 
		)
		const boardTicketLastUpdated = await db("tickets_to_boards").where("board_id", req.params.boardId).max("updated_at as updatedAt")
		const boardStatusLastUpdated = await db("boards_to_statuses").where("board_id", req.params.boardId).max("updated_at as updatedAt")
		// figure out which last updated is the most recent
		const mostRecentUpdate = Math.max(
			boardLastUpdated[0].updatedAt, 
			boardTicketLastUpdated[0].updatedAt,
			boardStatusLastUpdated[0].updatedAt,
		)
		res.json({"lastModified": new Date(mostRecentUpdate)})
	}	
	catch (err) {
		console.log(`Error while getting board last modified:  ${err.message}`)	
		next(err)
	}
})

router.get("/:boardId/ticket", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const board = await db("boards").where("id", req.params.boardId).first()
		let tickets = await db("tickets_to_boards")
		.join("tickets", "tickets.id", "=", "tickets_to_boards.ticket_id")
		.where("board_id", req.params.boardId)
		.modify((queryBuilder) => {
			if (req.query.limit){
				queryBuilder.limit(board.ticket_limit)
			}
		})
		.select(
			"tickets.id as id",
			"tickets.priority_id as priorityId",
			"tickets.name as name",
			"tickets.description as description",
			"tickets.status_id as statusId",
			"tickets.ticket_type_id as ticketTypeId",
			"tickets.organization_id as organizationId",
			"tickets.due_date as dueDate",
			"tickets.story_points as storyPoints",
			"tickets.user_id as userId",
			"tickets.created_at as createdAt",
		)
		if (req.query.includeAssignees){
			tickets = await Promise.all(
				tickets.map(async (ticket) => {
					const assignees = await db("tickets_to_users").where("ticket_id", ticket.id).where("is_watcher", false).where("is_mention", false).select(
						"user_id as userId",
					)
					return {
						...ticket,
						assignees: assignees.map((assignee) => assignee.userId)
					}					
				})
			)
		}
		if (req.query.includeRelationshipInfo){
			const epicTicketRelationshipType = await db("ticket_relationship_types").where("name" , "Epic").first()
			const epicTicketType = await db("ticket_types").where("name", "Epic").first()
			tickets = await Promise.all(
				tickets.map(async (ticket) => {
					const hasRelationship = await db("ticket_relationships")
					.where("child_ticket_id", ticket.id)
					.orWhere("parent_ticket_id", ticket.id).limit(1).first() != null
					// figure out if this ticket is attached as a child to a relationship that's typed as an Epic
					// note that the ticket itself cannot be an epic since you can't attach an epic to itself
					let epicParentTickets = []
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
					return {
						...ticket,
						hasRelationship,
						epicParentTickets,
					}
				}
			))
		}
		res.json(tickets)

	}	
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)
		next(err)
	}
})

router.post("/:boardId/ticket", validateBoardTicketCreate, handleValidationResult, async (req, res, next) => {
	try {
		const tickets = req.body.ticket_ids
		const boardId = req.params.boardId
		await db("tickets_to_boards").insert(tickets.map((ticketId) => ({board_id: boardId, ticket_id: ticketId})))
		res.json({message: "tickets inserted into board successfully!"})
	}	
	catch (err) {
		console.log(`Error while inserting tickets into board: ${err.message}`)
		next(err)
	}
})

router.get("/:boardId/ticket/:ticketId", validateBoardTicketGet, handleValidationResult, async (req, res, next) => {
	try {
		const tickets = await db("tickets_to_boards")
		.join("tickets", "tickets.id", "=", "tickets_to_boards.ticket_id")
		.where("board_id", req.params.boardId)
		.where("ticket_id", req.params.ticketId)
		.select(
			"tickets.id as id",
			"tickets.priority_id as priorityId",
			"tickets.name as name",
			"tickets.description as description",
			"tickets.status_id as statusId",
			"tickets.due_date as dueDate",
			"tickets.story_points as storyPoints",
			"tickets.ticket_type_id as ticketTypeId",
			"tickets.organization_id as organizationId",
			"tickets.created_at as createdAt"
		)
		res.json(tickets)

	}	
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)
		next(err)
	}
})

router.delete("/:boardId/ticket/:ticketId", validateBoardTicketDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets_to_boards").where("ticket_id", req.params.ticketId).where("board_id", req.params.boardId).del()
		res.json({message: "ticket deleted from board successfully!"})
	}
	catch (err) {
		console.log(`Error while deleting ticket from board: ${err.message}`)
		next(err)
	}
})

router.get("/:boardId/status", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const statuses = await db("boards_to_statuses")
		.join("statuses", "statuses.id", "=", "boards_to_statuses.status_id")
		.where("board_id", req.params.boardId)
		.modify((queryBuilder) => {
			if (req.query.isActive) {
				queryBuilder.where("statuses.is_active", req.query.isActive === "true" ? true : false)
			}
		})
		.orderBy("statuses.order")
		.select(
			"statuses.id as id",
			"statuses.name as name",
			"statuses.order as order",
			"statuses.is_active as isActive",
			"boards_to_statuses.limit as limit",
			"statuses.is_completed as isCompleted",
			"statuses.organization_id as organizationId")
		res.json(statuses)
	}
	catch (err) {
		console.log(`Error while getting statuses: ${err.message}`)
		next(err)
	}
})

router.get("/:boardId/status/:statusId", validateBoardStatusGet, handleValidationResult, async (req, res, next) => {
	try {
		const status = await db("boards_to_statuses")
		.join("statuses", "statuses.id", "=", "boards_to_statuses.status_id")
		.where("board_id", req.params.boardId)
		.where("status_id", req.params.statusId)
		.select(
			"statuses.id as id",
			"statuses.name as name",
			"statuses.order as order",
			"boards_to_statuses.limit as limit",
			"statuses.is_active as isActive",
			"statuses.is_completed as isCompleted",
			"statuses.organization_id as organizationId").first()
		res.json(status)

	}	
	catch (err) {
		console.log(`Error while getting status: ${err.message}`)
		next(err)
	}
})

router.post("/:boardId/status", validateBoardStatusCreate, handleValidationResult, async (req, res, next) => {
	try {
		const statusIds = req.body.status_ids
		const boardId = req.params.boardId
		await db("boards_to_statuses").insert(statusIds.map((statusId) => ({status_id: statusId, board_id: boardId})))
		res.json({message: "statuses inserted into board successfully!"})
	}
	catch (err) {
		console.log(`Error while inserting statuses: ${err.message}`)
		next(err)
	}
})

router.put("/:boardId/status/:statusId", validateBoardStatusUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const limit = req.body.limit	
		const boardId = req.params.boardId
		const statusId = req.params.statusId
		await db("boards_to_statuses").where("status_id", statusId).where("board_id", boardId).update({
			limit
		})
		res.json({message: "Status updated successfully!"})
	}	
	catch (err){
		console.error(`Error while updating status: ${err.message}`)
		next(err)
	}
})

router.post("/:boardId/status/bulk-edit", validateBoardStatusBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const statusIds = req.body.status_ids
		const boardId = req.params.boardId
		// delete all status ids attached to this board and then re-insert
		const toInsert = statusIds.map((id) => ({board_id: boardId, status_id: id}))
		await db("boards_to_statuses").where("board_id", boardId).delete()
		await db("boards_to_statuses").insert(toInsert)
		res.json({message: "statuses bulk edited successfully"})
	}	
	catch (err) {
		console.log(`Error while updating board statuses: ${err.message}`)
		next(err)
	}
})

router.delete("/:boardId/status/:statusId", validateBoardStatusDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("boards_to_statuses")
		.where("status_id", req.params.statusId)
		.where("board_id", req.params.boardId)
		.del()
		res.json({"message": "status deleted successfully!"})
	}
	catch (err) {
		console.log(`Error while deleting status: ${err.message}`)
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		const id = await db("boards").insert({
			name: body.name,
			ticket_limit: body.ticket_limit,
			organization_id: body.organization_id
		},["id"])
		res.json({id: id[0], message: "Board inserted successfully!"})
	}	
	catch (err) {
		console.error(`Error while creating Board: ${err.message}`)
		next(err)
	}
})

router.put("/:boardId", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("boards").where("id", req.params.boardId).update({
			name: req.body.name,
			ticket_limit: req.body.ticket_limit,
		})
		res.json({message: "Board updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating Board: ${err.message}`)
		next(err)
	}
})

router.delete("/:boardId", validateDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("boards").where("id", req.params.boardId).del()
		res.json({message: "Board deleted successfully!"})
	}
	catch (err){
		console.log(`Error while deleting Board: ${err.message}`)
		next(err)
	}
})

module.exports = router
