const express = require("express")
const router = express.Router()
const {
	validateSprintGet,
    validateSprintGetById,
	validateSprintCreate,
	validateSprintUpdate,
	validateSprintDelete,
	validateSprintTicketGet,
	validateSprintTicketDelete,
    validateSprintTicketGetById,
	validateSprintTicketUpdate,
	validateSprintComplete,
}  = require("../validation/sprint")
const { insertAndGetId } = require("../helpers/functions") 
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { searchTicketByAssignee, searchTicketByReporter } = require("../helpers/query-helpers")
const { aggregateCompletedAndOpenSprintTickets } = require("../helpers/functions")
const HistoryService = require('../services/history-service')
const db = require("../db/db")

historyService = new HistoryService(db)

router.get("/", validateSprintGet, handleValidationResult, async (req, res, next) => {
	try {
		const { page } = req.query
		const completedStatuses = await db("statuses").where("is_completed", true).where("is_active", true).where("organization_id", req.user.organization)
		const completedStatusIds = completedStatuses.map((status) => status.id)
		const sprints = await db("sprints")
		.modify((queryBuilder) => {
			if (req.query.boardId){
				queryBuilder.where("board_id", req.query.boardId)
			}
			if (req.query.recent){
				queryBuilder.orderBy("created_at", "desc")
			}
			if (req.query.filterInProgress){
				queryBuilder.where("is_completed", false)
			}
			if (req.query.query || req.query.searchBy === "name"){
				queryBuilder.whereILike("name", `%${req.query.query}%`)
			}
			if (req.query.checkOverlapping && req.query.startDate && req.query.endDate){
				queryBuilder.andWhereRaw(
					"DATE(sprints.start_date) <= DATE(?) AND DATE(sprints.end_date) >= DATE(?)",
					[req.query.endDate, req.query.startDate]
				)
			}
		})
		.select(
			"sprints.id",
			"sprints.name",
			"sprints.goal",
			"sprints.debrief",
			"sprints.start_date as startDate",
			"sprints.end_date as endDate",
			"sprints.is_completed as isCompleted",
			"sprints.board_id as boardId",
			"sprints.created_at as createdAt",
			"sprints.num_open_tickets as numOpenTickets",
			"sprints.num_completed_tickets as numCompletedTickets"
		)
		.orderBy("start_date", "desc")
		.paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		let data = sprints.data
		if (req.query.includeTicketStats){
			data = await Promise.all(sprints.data.map(async (sprint) => {
				if (!sprint.isCompleted){
					// show the updated ticket stats over the stats listed in the db record
					const { numCompletedTickets, numOpenTickets } = await aggregateCompletedAndOpenSprintTickets(sprint.id, completedStatusIds)	
					return {
						...sprint,
						numCompletedTickets: numCompletedTickets,
						numOpenTickets: numOpenTickets,
					}
				}
				return {
					...sprint
				}
			}))
		}
		res.json({
			data: data,
			pagination: sprints.pagination
		})
	}
	catch (err) {
		console.error(`Error while getting sprints: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId", validateSprintGetById, handleValidationResult, async (req, res, next) => {
	try {
		const { sprintId } = req.params
		const completedStatuses = await db("statuses").where("is_completed", true).where("is_active", true).where("organization_id", req.user.organization)
		const completedStatusIds = completedStatuses.map((status) => status.id)
		const sprint = await db("sprints")
		.where("sprints.id", sprintId)
		.modify((queryBuilder) => {
			if (req.query.boardId){
				queryBuilder.where("board_id", req.query.boardId)
			}
		})
		.select(
			"sprints.id",
			"sprints.name",
			"sprints.goal",
			"sprints.debrief",
			"sprints.start_date as startDate",
			"sprints.end_date as endDate",
			"sprints.is_completed as isCompleted",
			"sprints.board_id as boardId",
			"sprints.created_at as createdAt",
			"sprints.num_open_tickets as numOpenTickets",
			"sprints.num_completed_tickets as numCompletedTickets",
		)
		.first()
		let data = sprint
		if (req.query.includeTicketStats){
			if (!data.isCompleted){
				const { numCompletedTickets, numOpenTickets } = await aggregateCompletedAndOpenSprintTickets(sprint.id, completedStatusIds)	
				data = {
					...data,
					numCompletedTickets: numCompletedTickets,
					numOpenTickets: numOpenTickets,
				}
			}
		}
		res.json(data)
	}
	catch (err) {
		console.error(`Error while getting sprint: ${err.message}`)
		next(err)
	}
})

router.post("/", validateSprintCreate, handleValidationResult, async (req, res, next) => {
	try {
		const { name, goal, start_date, end_date, board_id } = req.body
		const id = await insertAndGetId("sprints", {
			name,
			goal,
			start_date: new Date(start_date),
			end_date: new Date(end_date),
			user_id: req.user.id, 
			organization_id: req.user.organization,
			board_id,
		})
		res.json({id: id, message: "Sprint is created successfully!"})
	}
	catch (err) {
		console.error(`Error while creating sprint: ${err.message}`)
		next(err)
	}
})

router.put("/:sprintId", validateSprintUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const { sprintId } = req.params
		const { name, goal, start_date, end_date, debrief, is_completed } = req.body
		const existingSprint = await db("sprints").where("id", sprintId).first()
		const updatedRows = await db("sprints").where({ id: sprintId }).update({
			name,
			goal,
			// cannot update the start and end date if the sprint is already completed
			...(!existingSprint?.is_completed ? {
				start_date: new Date(start_date),
				end_date: new Date(end_date),
			} : {}),
			debrief,
			is_completed,
		})
		res.json({ message: "Sprint updated successfully." })
	}
	catch (err) {
		console.error(`Error while updating sprint: ${err.message}`)
		next(err)
	}
})

router.post("/:sprintId/complete", validateSprintComplete, handleValidationResult, async (req, res, next) => {
	try {
		const { move_items_option, debrief, is_completed } = req.body
		const { sprintId } = req.params
		const existingSprint = await db("sprints").where("id", sprintId).first()
		if (!existingSprint){
			res.status(400).json({message: "Something has gone wrong!"})

		}
		// get the most updated current ticket statistics, which
		// will be written into the db as a "final" statistic. So even if the statuses of the actual tickets that 
		// were attached to the sprint are changed, the statistic remains
		const completedStatuses = await db("statuses").where("is_completed", true).where("is_active", true).where("organization_id", req.user.organization)
		const completedStatusIds = completedStatuses.map((status) => status.id)
		const { numCompletedTickets, numOpenTickets } = await aggregateCompletedAndOpenSprintTickets(sprintId, completedStatusIds)	
		await db("sprints").where("id", sprintId).update({
			debrief: debrief,
			is_completed: is_completed,
			num_completed_tickets: numCompletedTickets,
			num_open_tickets: numOpenTickets,
		})

		if (move_items_option === "NEW SPRINT"){
			const newSprintId = await insertAndGetId("sprints", {
				name: "New Sprint",
				start_date: null,
				end_date: null,
				board_id: existingSprint.board_id,
				user_id: existingSprint.user_id,
				organization_id: existingSprint.organization_id,
				goal: existingSprint.goal,
				debrief: "",
				is_completed: false
			})
			// get all existing ticketids for this sprint
			const existingTickets = await db("tickets_to_sprints").where("sprint_id", sprintId)
			const toInsert = existingTickets.map((obj) => {
				return {
					ticket_id: obj.ticket_id,
					sprint_id: newSprintId
				}
			})
			// insert existing tickets into the new sprint
			await historyService.bulkInsert("tickets_to_sprints", toInsert, {
				...req.historyContext,
				useParentEntityId: "ticket_id",
				bulkParentEntityInfo: toInsert.map((obj) => ({
					parentEntityType: "tickets",
					parentEntityId: obj.ticket_id
				}))
			})
		}
		// if moving to the backlog (OR we're done inserting tickets into the new sprint),
		// we actually don't do anything since we want to keep the tickets attached to the sprint to keep a record
		// of which tickets were in there.

		res.json({message: "Sprint completed successfully!"})
	}	
	catch (err){
		console.error(`Error while completing sprint: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId/ticket", validateSprintTicketGet, handleValidationResult, async (req, res, next) => {
	try {
		const data = await db("tickets_to_sprints").where("sprint_id", req.params.sprintId).join("tickets", "tickets.id", "=", "tickets_to_sprints.ticket_id").select(
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
		.modify((queryBuilder) => {
			if (req.query.searchBy === "title"){
				queryBuilder.whereILike("tickets.name", `%${req.query.query}%`)
			}
			else if (req.query.searchBy === "assignee"){
				searchTicketByAssignee(queryBuilder, req.query.query)
			}
			else if (req.query.searchBy === "reporter"){
				searchTicketByReporter(queryBuilder, req.query.query)
			}
		})
		.paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});

		let tickets = {}
		if (req.query.includeAssignees){
			tickets =  await Promise.all(
				data.data.map(async (ticket) => {
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
		res.json({
			data: tickets,
			pagination: data.pagination
		})
	}
	catch (err) {
		console.error(`Error while getting sprint ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId/ticket/:ticketId", validateSprintTicketGetById, handleValidationResult, async (req, res, next) => {
    try {
        const data = await db("tickets_to_sprints").where("ticket_id", req.params.ticketId).where("sprint_id", req.params.sprintId).join("tickets", "tickets.id", "=", "tickets_to_sprints.ticket_id").select(
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
		).first()
		res.json(data)
    }
    catch (err){
        console.error(`Error while getting sprint ticket: ${err.message}`)
    }
})

router.post("/:sprintId/ticket", validateSprintTicketUpdate, handleValidationResult, async (req, res, next) => {
	try {
		const toInsert = req.body.ticket_ids.map((ticket_id) => {
			return {
				ticket_id: ticket_id,
				sprint_id: req.params.sprintId
			}
		})
		await historyService.bulkInsert("tickets_to_sprints", toInsert, {
			...req.historyContext,
			useParentEntityId: "ticket_id",
			bulkParentEntityInfo: toInsert.map((obj) => ({
				parentEntityType: 'tickets',
				parentEntityId: obj.ticket_id 
			}))
		})
		res.json({message: "tickets inserted successfully!"})
	}
	catch (err) {
		console.error(`Error while updating sprint ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:sprintId/ticket", validateSprintTicketDelete, handleValidationResult, async (req, res, next) => {
	try {
		const existingTickets = await db("tickets_to_sprints").where("sprint_id", req.params.sprintId).whereIn("ticket_id", req.body.ticket_ids)
		await historyService.bulkDelete("tickets_to_sprints", (queryBuilder) => {
			queryBuilder.where("sprint_id", req.params.sprintId).whereIn("ticket_id", req.body.ticket_ids)
		}, {
			...req.historyContext,
			useParentEntityId: "ticket_id",		
			bulkParentEntityInfo: existingTickets.map((obj) => ({
				parentEntityType: "tickets",
				parentEntityId: obj.ticket_id
			}))
		})
		res.json({message: "tickets deleted successfully!"})
	}
	catch (err){
		console.error(`Error while deleting sprint ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:sprintId", validateSprintDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("sprints").where("sprint_id", req.params.sprintId).del()
		res.json({message: "Sprint deleted successfully!"})
	}
	catch (err) {
		console.error(`Error while deleting sprint: ${err.message}`)
		next(err)
	}
})

module.exports = router
