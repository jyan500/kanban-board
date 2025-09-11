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
}  = require("../validation/sprint")
const { insertAndGetId } = require("../helpers/functions") 
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { searchTicketByAssignee } = require("../helpers/query-helpers")
const db = require("../db/db")

router.get("/", validateSprintGet, handleValidationResult, async (req, res, next) => {
	try {
		const { page } = req.query
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
			"sprints.created_at as createdAt"
		).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		res.json(sprints)
	}
	catch (err) {
		console.error(`Error while getting sprints: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId", validateSprintGetById, handleValidationResult, async (req, res, next) => {
	try {
		const { sprintId } = req.params
		const sprint = await db("sprints")
		.where("sprints.id", sprintId)
		.select(
			"sprints.id",
			"sprints.name",
			"sprints.goal",
			"sprints.debrief",
			"sprints.start_date as startDate",
			"sprints.end_date as endDate",
			"sprints.is_completed as isCompleted",
			"sprints.board_id as boardId",
			"sprints.created_at as createdAt"
		)
		.first()
		res.json(sprint)
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
			start_date,
			end_date,
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
		const updatedRows = await db("sprints").where({ id: sprintId }).update({
			name,
			goal,
			start_date,
			end_date,
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
				queryBuilder.join("users", "users.id", "=", "tickets.user_id").whereILike("users.first_name", `%${req.query.query}%`)
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
		await db("tickets_to_sprints").insert(req.body.ticket_ids.map((ticket_id) => {
			return {
				ticket_id: ticket_id,
				sprint_id: req.params.sprintId
			}
		}))
		res.json({message: "tickets inserted successfully!"})
	}
	catch (err) {
		console.error(`Error while updating sprint ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:sprintId/ticket", validateSprintTicketDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets_to_sprints").where("sprint_id", req.params.sprintId).whereIn("ticket_id", req.body.ticket_ids).del()
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
