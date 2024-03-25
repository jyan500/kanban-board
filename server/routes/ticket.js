const express = require("express")
const router = express.Router()
const helper = require("../helper")
const { validateCreate, validateUpdate, validateDelete }  = require("../validation/tickets")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const tickets = await db("tickets")
		res.json(tickets)
	}
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const tickets = await db("tickets").where("id", req.params.id)
		res.json(tickets)
	}	
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").insert(req.body)
		res.json({message: "Ticket inserted successfully!"})
	}	
	catch (err) {
		console.error(`Error while creating ticket: ${err.message}`)
		next(err)
	}
})

router.put("/:id", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").where("id", req.params.id).update(req.body)
		res.json({message: "Ticket updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:id", validateDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").where("id", req.params.id).del()
		res.json({message: "Ticket deleted successfully!"})
	}
	catch (err){
		console.log(`Error while deleting ticket: ${err.message}`)
		next(err)
	}
})

module.exports = router
