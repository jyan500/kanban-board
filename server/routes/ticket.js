const express = require("express")
const router = express.Router()
const helper = require("../helper")
const { validateCreate, validateUpdate, validateDelete }  = require("../validation/ticket")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const tickets = await db("tickets").where("organization_id", req.user.organization)
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
		const body = {...req.body, organization_id: req.user.organization}
		await db("tickets").insert({
			name: body.name,
			description: body.description,
			priority_id: body.priority_id,
			status_id: body.status_id,
			ticket_type_id: body.ticket_type_id,
			organization_id: body.organization_id
		})
		res.json({message: "Ticket inserted successfully!"})
	}	
	catch (err) {
		console.error(`Error while creating ticket: ${err.message}`)
		next(err)
	}
})

router.put("/:id", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("tickets").where("id", req.params.id).update({
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
