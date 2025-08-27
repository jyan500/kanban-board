const express = require("express")
const router = express.Router()
const { 
	validateGet, 
	validateCreate, 
	validateUpdate, 
	validateDelete,
	validateCreateProjectBoard,
	validateDeleteProjectBoard,
}  = require("../validation/project")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")
const { retryTransaction, insertAndGetId, mapIdToRowAggregateArray, mapIdToRowAggregateObjArray, mapIdToRowObject } = require("../helpers/functions") 
const { DEFAULT_PER_PAGE } = require("../constants")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { getAssigneesFromBoards } = require("../helpers/query-helpers")

router.get("/", async (req, res, next) => {
	try {
		const data = await db("projects").select(
			"projects.id as id",
			"projects.name as name",
			"projects.user_id as userId",
			"projects.image_url as imageUrl",
			"projects.description as description",
			"projects.created_at as createdAt",
		).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		res.json(data)
	}
	catch (err) {
		console.error(`Error while getting projects: ${err.message}`)	
		next(err)
	}
})

router.get("/:projectId", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const data = await db("projects").where("id", req.params.projectId).select(
			"projects.id as id",
			"projects.name as name",
			"projects.user_id as userId",
			"projects.image_url as imageUrl",
			"projects.description as description",
			"projects.created_at as createdAt",
		).first()
		res.json(data)
	}	
	catch (err) {
		console.error(`Error while getting project: ${err.message}`)	
		next(err)
	}
})

router.get("/:projectId/board", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const data = await db("projects_to_boards").join("boards", "boards.id", "=", "projects_to_boards.board_id").where("project_id", req.params.projectId).select(
			"boards.id as id",
			"boards.name as name",
			"boards.ticket_limit as ticketLimit",
			"boards.is_sprint as isSprint",
			"boards.is_sprint_complete as isSprintComplete",
			"boards.sprint_debrief as sprintDebrief",
			"boards.user_id as userId",
			"boards.description as description",
			"boards.start_date as startDate",
			"boards.end_date as endDate",
			"boards.created_at as createdAt"
		).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true})
		let boardAssignees;
		let boardAssigneesRes = {}
		let resData = []
		if (req.query.assignees === "true"){
			boardAssignees = await getAssigneesFromBoards(req.user.organization, data.data.map((board) => board.id))
			boardAssigneesRes = mapIdToRowAggregateObjArray(boardAssignees, ["userId", "firstName", "lastName", "imageUrl"])
		}
		resData = data.data.map((board) => {
			if (req.query.assignees === "true" && board.id in boardAssigneesRes){
				return {...board, assignees: Object.keys(boardAssigneesRes).length > -1 ? boardAssigneesRes[board.id] : []}
			}
		}).filter((board) => board)	
		res.json({
			data: resData,
			pagination: data.pagination
		})
	}	
	catch (err){
		console.error(`Error while getting boards: ${err.message}`)
		next(err)
	}
})

router.post("/:projectId/board", validateCreateProjectBoard, handleValidationResult, async (req, res, next) => {
	try {
		await db("projects_to_boards").insert(req.body.board_ids.map((id) => {
			return {
				project_id: req.params.projectId,
				board_id: id,
			}
		}))
		res.json({message: "Board attached to project successfully!"})
	}	
	catch (err){
		console.error(`Error while adding board to project: ${err.message}`)
		next(err)
	}
})

router.delete("/:projectId/board", validateDeleteProjectBoard, handleValidationResult, async (req, res, next) => {
	try {
		await db("projects_to_boards").whereIn("board_id", req.body.board_ids).del()
		res.json({message: "Board removed from project successfully!"})
	}	
	catch (err){
		console.error(`Error while deleting board from project: ${err.message}`)
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		const id = await insertAndGetId("projects", body)
		res.json({id: id, message: "Project created successfully!"})
	}	
	catch (err) {
		console.error(`Error while creating project: ${err.message}`)
		next(err)
	}
})

router.put("/:projectId", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("projects").where("id", req.params.projectId).update({
			name: req.body.name,
			user_id: req.body.user_id,
			image_url: req.body.image_url,
			description: req.body.description,
		})
		res.json({message: "Project updated successfully!"})
	}	
	catch (err) {
		console.error(`Error while updating project: ${err.message}`)
		next(err)
	}
})

router.delete("/:projectId", validateDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("projects").where("id", req.params.projectId).del()
		res.json({message: "Project deleted successfully!"})
	}
	catch (err){
		console.error(`Error while deleting project: ${err.message}`)
		next(err)
	}
})

module.exports = router
