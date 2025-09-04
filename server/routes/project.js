const express = require("express")
const router = express.Router()
const { 
	validateGet, 
	validateCreate, 
	validateUpdate, 
	validateDelete,
	validateCreateProjectBoard,
	validateDeleteProjectBoard,
	validateImageUpload,
}  = require("../validation/project")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")
const { retryTransaction, insertAndGetId, mapIdToRowAggregateArray, mapIdToRowAggregateObjArray, mapIdToRowObject } = require("../helpers/functions") 
const { DEFAULT_PER_PAGE } = require("../constants")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")
const { getNumTicketsFromBoards, getLastModified, getAssigneesFromBoards } = require("../helpers/query-helpers")

router.get("/", async (req, res, next) => {
	try {
		const data = await db("projects").modify(
			(queryBuilder) => {
				if (req.query.query){
					queryBuilder.whereILike("name",	`%${req.query.query}%`)
				}	
			}
		).select(
			"projects.id as id",
			"projects.name as name",
			"projects.user_id as userId",
			"projects.image_url as imageUrl",
			"projects.description as description",
			"projects.created_at as createdAt",
		)
		.paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		const resData = await Promise.all(data.data.map(async (project) => {
			const user = await db("users").where("id", project.userId).first()
			return {
				...project,
				owner: {
					id: project.user_id,
					firstName: user.first_name,
					lastName: user.last_name,
					imageUrl: user.image_url,
				}
			}
		}))
		res.json({
			data: resData,
			pagination: data.pagination
		})
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
		const user = await db("users").where("id", data.userId).first()
		res.json({
			...data,
			owner: {
				id: user.id,
				firstName: user.first_name,
				lastName: user.last_name,
				imageUrl: user.image_url,
			}
		})
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
			"boards.user_id as userId",
			"boards.description as description",
			"boards.created_at as createdAt"
		).modify((queryBuilder) => {
			if (req.query.lastModified === "true"){
				getLastModified(queryBuilder)	
			}
		}).paginate({ perPage: req.query.perPage ?? 10, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true})
		let boardAssignees;
		let boardAssigneesRes = {}
		let resData = []
		if (req.query.assignees === "true"){
			boardAssignees = await getAssigneesFromBoards(req.user.organization, data.data.map((board) => board.id))
			boardAssigneesRes = mapIdToRowAggregateObjArray(boardAssignees, ["userId", "firstName", "lastName", "imageUrl"])
		}
		let numTickets;
		let numTicketsRes = {}
		if (req.query.numTickets === "true") {
			numTickets = await getNumTicketsFromBoards(req.user.organization, data.data.map((b) => b.id))
			numTicketsRes = mapIdToRowObject(numTickets)
		}
		if (req.query.lastModified === "true" || req.query.assignees === "true" || req.query.numTickets === "true" || req.query.includeUserDashboardInfo){
			resData = data.data.map((board) => {
				let lastUpdated;
				if (req.query.lastModified === "true"){
					lastUpdated = new Date(Math.max(board.boardStatusesUpdatedAt, board.ticketsUpdatedAt, board.boardUpdatedAt))
				}
				let boardRes = {
					...board,
					...(req.query.lastModified === "true" ? {lastModified: lastUpdated ?? null} : {})
				}
				if (req.query.assignees === "true" && board.id in boardAssigneesRes){
					boardRes = {...boardRes, assignees: Object.keys(boardAssigneesRes).length > -1 ? boardAssigneesRes[board.id] : []}
				}
				if (req.query.numTickets === "true" && board.id in numTicketsRes){
					boardRes = {...boardRes, numTickets: Object.keys(numTicketsRes).length > 0 ? numTicketsRes[board.id].numTickets : 0}
				}
				return boardRes
			})
		}
		else {
			resData = data.data
		}
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
		// get existing boards and filter out the boards that have already been added
		const existingBoards = await db("projects_to_boards").where("project_id", req.params.projectId)
		const existingBoardIds = existingBoards.map((board) => board.board_id)
		const idsToAdd = req.body.board_ids.filter((id) => !existingBoardIds.includes(id))
		// the ids to delete are the ones present in existing board ids but are not present in the request board ids
		const idsToDelete = existingBoardIds.filter((id) => !req.body.board_ids.includes(id))
		if (idsToAdd.length){
			await db("projects_to_boards").insert(idsToAdd.map((id) => {
				return {
					project_id: req.params.projectId,
					board_id: id,
				}
			}))
		}
		if (idsToDelete.length){
			await db("projects_to_boards").where("project_id", req.params.projectId).whereIn("board_id", idsToDelete).del()
		}
		res.json({message: "Board attached to project successfully!"})
	}	
	catch (err){
		console.error(`Error while adding board to project: ${err.message}`)
		next(err)
	}
})

router.delete("/:projectId/board", validateDeleteProjectBoard, handleValidationResult, async (req, res, next) => {
	try {
		await db("projects_to_boards").where("projectId", req.params.projectId).whereIn("board_id", req.body.board_ids).del()
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

router.post("/image", validateImageUpload, handleValidationResult, async (req, res, next) => {
	try {
		await db("projects").where("id", req.body.id).update({
			image_url: req.body.image_url
		})
		res.json({message: "Project image uploaded successfully!"})
	}	
	catch (err){
		console.error(`Error while updating project: ${err.message}`)
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
