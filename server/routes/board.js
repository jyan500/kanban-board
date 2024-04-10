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
}  = require("../validation/board")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const boards = await db("boards").where("organization_id", req.user.organization)
		res.json(boards)
	}
	catch (err) {
		console.log(`Error while getting boards: ${err.message}`)	
		next(err)
	}
})

router.get("/:boardId", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const boards = await db("boards").where("id", req.params.boardId)
		res.json(boards)
	}	
	catch (err) {
		console.log(`Error while getting Boards: ${err.message}`)	
		next(err)
	}
})

router.get("/:boardId/ticket", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const tickets = await db("tickets_to_boards")
		.join("tickets", "tickets.id", "=", "tickets_to_boards.ticket_id")
		.where("board_id", req.params.boardId)
		.select("tickets.*")
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
		.select("tickets.*")
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

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		await db("boards").insert({
			name: body.name,
			organization_id: body.organization_id
		})
		res.json({message: "Board inserted successfully!"})
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
