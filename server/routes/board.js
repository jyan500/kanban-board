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
	validateBoardTicketBulkDelete,
	validateBoardStatusGet,
	validateBoardStatusCreate,
	validateBoardStatusUpdate,
	validateBoardStatusDelete,
	validateBoardStatusBulkEdit,
	validateBoardProjectsGet,
	validateBoardProjectsUpdate,
	validateBoardSprintGet,
	validateBoardSprintGetById,
	validateBoardFilterGet,
	validateBoardFilterUpdate,
}  = require("../validation/board")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")
const { retryTransaction, insertAndGetId, mapIdToRowAggregateArray, mapIdToRowAggregateObjArray, mapIdToRowObject } = require("../helpers/functions") 
const { DEFAULT_PER_PAGE } = require("../constants")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { getAssigneesFromBoards, getNumTicketsFromBoards, getLastModified, searchTicketByAssignee } = require("../helpers/query-helpers")

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
				getLastModified(queryBuilder)	
			}
			if (req.query.includeUserDashboardInfo){
				queryBuilder.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")	
				.join("tickets", "tickets.id", "=", "tickets_to_boards.ticket_id")
				.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets.id")
				.groupBy("tickets_to_users.user_id")
				.groupBy("boards.id")
				.groupBy("boards.ticket_limit")
				.groupBy("boards.name")
				.groupBy("boards.organization_id")
				.where("tickets_to_users.user_id", "=", req.user.id)
			}
		})	
		.select(
			"boards.id as id", 
			"boards.ticket_limit as ticketLimit", 
			"boards.name as name", 
			"boards.organization_id as organizationId",
		).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});

		let boardAssignees;
		let boardAssigneesRes = {}
		if (req.query.assignees === "true"){
			boardAssignees = await getAssigneesFromBoards(req.user.organization, boards.data.map((b) => b.id))
			boardAssigneesRes = mapIdToRowAggregateObjArray(boardAssignees, ["userId", "firstName", "lastName", "imageUrl"])
		}

		let numTickets;
		let numTicketsRes = {}
		if (req.query.numTickets === "true") {
			numTickets = await getNumTicketsFromBoards(req.user.organization, boards.data.map((b) => b.id))
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
			.groupBy("boards.id")
			.groupBy("tickets.id")
			.groupBy("tickets.status_id")
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
					const minutesSpent = !isNaN(Number(obj.minutesSpent)) ? Number(obj.minutesSpent) : 0 
					return acc + parseInt(minutesSpent)
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
					...board,
					...(req.query.lastModified === "true" ? {lastModified: lastUpdated ?? null} : {})
				}
				if (req.query.includeUserDashboardInfo){
					boardRes = {...boardRes,
						percentComplete: dashboardInfoMap[board.id]?.percentComplete ?? 0,
						minutesSpent: dashboardInfoMap[board.id]?.minutesSpent ?? 0
					}
				}
				if (req.query.assignees === "true" && board.id in boardAssigneesRes){
					boardRes = {...boardRes, assignees: Object.keys(boardAssigneesRes).length > 0 ? boardAssigneesRes[board.id] : []}
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
		console.error(`Error while getting boards: ${err.message}`)	
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
			let boardRes = {...board}
			if (req.query.assignees === "true" && board.id in boardAssigneesRes){
				boardRes = {...boardRes, assignees: Object.keys(boardAssigneesRes).length > 0 ? boardAssigneesRes[board.id] : []}
			}	
			return boardRes
		})
		res.json(resData)
	}	
	catch (err) {
		console.error(`Error while getting Boards: ${err.message}`)	
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
		console.error(`Error while getting board last modified:  ${err.message}`)	
		next(err)
	}
})

router.get("/:boardId/ticket", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const board = await db("boards").where("id", req.params.boardId).first()
		const completedStatuses = await db("statuses").where("is_completed", true).where("is_active", true).where("organization_id", req.user.organization)
		const completedStatusIds = completedStatuses.map((status) => status.id)	
		let tickets = db("tickets_to_boards")
		.join("tickets", "tickets.id", "=", "tickets_to_boards.ticket_id")
		.where("board_id", req.params.boardId)
		.modify((queryBuilder) => {
			if (req.query.searchBy === "title"){
				queryBuilder.whereILike("tickets.name", `%${req.query.query}%`)
			}
			else if (req.query.searchBy === "assignee"){
				searchTicketByAssignee(queryBuilder, req.query.query)
			}
			else if (req.query.searchBy === "reporter"){
				queryBuilder.join("users", "users.id", "=", "tickets.user_id").whereILike("users.first_name", `%${req.query.query}%`)
			}
			if (req.query.limit){
				queryBuilder.limit(board.ticket_limit)
			}
			if (req.query.requireDueDate){
				queryBuilder.whereNotNull("tickets.due_date")
			}
			if (req.query.assignee){
				queryBuilder.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets.id").where("tickets_to_users.user_id", req.query.assignee)
			}
			if (req.query.ticketTypeId) {
				queryBuilder.where("tickets.ticket_type_id", req.query.ticketTypeId)
			}
			if (req.query.priorityId){
				queryBuilder.where("tickets.priority_id", req.query.priorityId)
			}
			if (req.query.statusId){
				queryBuilder.where("tickets.status_id", req.query.statusId)
			}
			if (req.query.sprintId){
				queryBuilder.join("tickets_to_sprints", "tickets_to_sprints.ticket_id", "=", "tickets.id").where("tickets_to_sprints.sprint_id", req.query.sprintId)
			}
			if (req.query.excludeStatuses){
				queryBuilder.whereNotIn("tickets.status_id", req.query.excludeStatuses.split(","))
			}
			// If checkOverlapping is true, and both startDate and endDate are provided, check for interval overlaps
			if (req.query.checkOverlapping === "true" && req.query.startDate && req.query.endDate) {
				queryBuilder.whereNotNull("tickets.due_date"); // Ensure ticket has a due date
				queryBuilder.andWhereRaw(
					"DATE(tickets.created_at) <= DATE(?) AND DATE(tickets.due_date) >= DATE(?)",
					[req.query.endDate, req.query.startDate]
				);
			}
			else if (!req.query.checkOverlapping){
				if (req.query.startDate){
					queryBuilder.whereRaw("DATE(tickets.created_at) >= ?", [req.query.startDate])
				}
				if (req.query.endDate){
					queryBuilder.whereRaw("DATE(tickets.due_date) <= ?", [req.query.endDate])
				}	
			}
			// exclude any tickets that are attached to a specific sprint using
			// a subquery
			if (req.query.excludeSprintId){
				queryBuilder.whereNotIn("tickets.id", db("tickets_to_sprints").where("tickets_to_sprints.sprint_id", req.query.excludeSprintId).select("tickets_to_sprints.ticket_id as id"))
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
		// hack to keep the tickets paginate data format into {data, pagination},
		// which finds the total amount of data and 
		// loads all data into one page. Should prioritize using pagination when possible.
		let ticketStats = {}
		if (req.query.skipPaginate || req.query.includeTicketStats){
			const ticketsForAmt = await tickets
			const total = ticketsForAmt.length
			if (req.query.includeTicketStats){
				const completedStatuses = await db("statuses").where("is_completed", true).where("is_active", true).where("organization_id", req.user.organization)
				const completedStatusIds = completedStatuses.map((status) => status.id)
				const numCompletedTickets = ticketsForAmt.filter((ticket) => completedStatusIds.includes(ticket.statusId)).length
				const numOpenTickets = ticketsForAmt.length - numCompletedTickets
				ticketStats = {
					numOpenTickets,
					numCompletedTickets
				}
				tickets = await retryTransaction(tickets.paginate({ perPage: req.query.perPage ?? DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true}));
			}
			else {
				tickets = await retryTransaction(tickets.paginate({ perPage: total, currentPage: 1, isLengthAware: true}))
			}
		}
		else {
			tickets = await retryTransaction(tickets.paginate({ perPage: req.query.perPage ?? DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true}));
		}

		if (req.query.includeTicketStats){
			tickets = {
				...tickets,
				additional: ticketStats
			}
		}

		if (req.query.includeAssignees){
			tickets = {
				...tickets,
				data: await Promise.all(
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
							lastName: assignee.lastName,
						}
						))
					}					
				})
			)
			}
		}

		if (req.query.includeRelationshipInfo){
			const epicTicketRelationshipType = await db("ticket_relationship_types").where("name" , "Epic").first()
			const epicTicketType = await db("ticket_types").where("name", "Epic").first()
			tickets = {
				...tickets,
				data: await Promise.all(
					tickets.data.map(async (ticket) => {
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
		}
		if (req.query.includeTimeSpent){
			tickets = {...tickets, data: await Promise.all(
				tickets.data.map(async (ticket) => {
					const timeSpent = await db("ticket_activity").where("ticket_id", ticket.id).sum("minutes_spent as timeSpent").first()
					return {
						...ticket,
						timeSpent: !isNaN(Number(timeSpent.timeSpent)) ? Number(timeSpent.timeSpent) : 0
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

router.post("/:boardId/ticket", validateBoardTicketCreate, handleValidationResult, async (req, res, next) => {
	try {
		const tickets = req.body.ticket_ids
		const boardId = req.params.boardId
		await retryTransaction(db("tickets_to_boards").insert(tickets.map((ticketId) => ({board_id: boardId, ticket_id: ticketId}))))
		res.json({message: "tickets inserted into board successfully!"})
	}	
	catch (err) {
		console.error(`Error while inserting tickets into board: ${err.message}`)
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
		console.error(`Error while getting tickets: ${err.message}`)
		next(err)
	}
})


router.delete("/:boardId/ticket", validateBoardTicketBulkDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets_to_boards").whereIn("ticket_id", req.body.ticket_ids).where("board_id", req.params.boardId).del()
		res.json({message: "tickets deleted from board successfully!"})
	}
	catch (err) {
		console.error(`Error while deleting tickets from board: ${err.message}`)
		next(err)
	}})


router.delete("/:boardId/ticket/:ticketId", validateBoardTicketDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets_to_boards").where("ticket_id", req.params.ticketId).where("board_id", req.params.boardId).del()
		res.json({message: "ticket deleted from board successfully!"})
	}
	catch (err) {
		console.error(`Error while deleting ticket from board: ${err.message}`)
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
		console.error(`Error while getting statuses: ${err.message}`)
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
		console.error(`Error while getting status: ${err.message}`)
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
		console.error(`Error while inserting statuses: ${err.message}`)
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
		console.error(`Error while updating board statuses: ${err.message}`)
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
		console.error(`Error while deleting status: ${err.message}`)
		next(err)
	}
})

router.get("/:boardId/project", validateBoardProjectsGet, handleValidationResult, async (req, res, next) => {
	try {
		const data = await db("projects_to_boards").where("board_id", req.params.boardId).join("projects", "projects.id", "=", "projects_to_boards.project_id").select(
			"projects.id as id",
			"projects.name as name",
			"projects.user_id as userId",
			"projects.description as description",
			"projects.created_at as createdAt"
		).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		res.json(data)
	}
	catch (err){
		console.error(`Error while getting projects: ${err.message}`)
		next(err)
	}
})

router.post("/:boardId/project", validateBoardProjectsUpdate, handleValidationResult, async (req, res, next) => {
	try {
		// get existing projects and filter out the projects that have already been added
		const existingProjects = await db("projects_to_boards").where("board_id", req.params.boardId)
		const existingProjectIds = existingProjects.map((project) => project.project_id)
		const idsToAdd = req.body.ids.filter((id) => !existingProjectIds.includes(id))
		// the ids to delete are the ones present in existing project ids but are not present in the request project ids
		const idsToDelete = existingProjectIds.filter((id) => !req.body.ids.includes(id))
		if (idsToAdd.length){
			await db("projects_to_boards").insert(idsToAdd.map((id) => {
				return {
					project_id: id,
					board_id: req.params.boardId,
				}
			}))
		}
		if (idsToDelete.length){
			await db("projects_to_boards").where("board_id", req.params.boardId).whereIn("project_id", idsToDelete).del()
		}
		res.json({message: "Projects attached to board successfully!"})
	}
	catch (err){
		console.error(`Error while adding projects to board: ${err.message}`)
		next(err)
	}
})

router.get("/:boardId/filter", validateBoardFilterGet, handleValidationResult, async (req, res, next) => {
	try {
		const data = await db("boards_to_filters")
		.where("boards_to_filters.board_id", req.params.boardId)
		.join("filters", "filters.id", "=", "boards_to_filters.filter_id")
		.select(
			"boards_to_filters.id as id",
			"filters.id as filter_id",
			"filters.name as name",
			"filters.order as order",
		)
		res.json(data)
	}
	catch (err){
		console.error(`Error while getting filters: ${err.message}`)
		next(err)
	}
})

router.post("/:boardId/filter", validateBoardFilterUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const existingFilters = await db("boards_to_filters").where("board_id", req.params.boardId)
		const existingFilterIds = existingFilters.map((filter) => filter.filter_id)
		const idsToAdd = req.body.ids.filter((id) => !existingFilterIds.includes(id))
		const idsToDelete = existingFilterIds.filter((id) => !req.body.ids.includes(id))
		if (idsToAdd.length){
			await db("boards_to_filters").insert(idsToAdd.map((id) => {
				return {
					filter_id: id,
					board_id: req.params.boardId,
				}
			}))
		}
		if (idsToDelete.length){
			await db("boards_to_filters").where("board_id", req.params.boardId).whereIn("filter_id", idsToDelete).del()
		}
		res.json({message: "Filters attached to board successfully!"})
	}
	catch (err){
		console.error(`Error while adding filters to board: ${err.message}`)
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		const id = await insertAndGetId("boards", {
			name: body.name,
			ticket_limit: body.ticket_limit,
			organization_id: body.organization_id,
			user_id: req.user.id,
		})
		res.json({id: id, message: "Board inserted successfully!"})
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
		console.error(`Error while deleting Board: ${err.message}`)
		next(err)
	}
})

module.exports = router
