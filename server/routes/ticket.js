const express = require("express")
const router = express.Router()
const helper = require("../helper")
const ticketValidation = require("../validation/tickets")
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

router.post("/", async (req, res, next) => {
	try {
		const {result: isValid, errors} = await ticketValidation.validateTicket(req.body)
		if (isValid){
			await db("tickets").insert(req.body)
			res.json({message: "Ticket inserted successfully!"})
		}
		else {
			res.status(400).json({status: 400, errors: errors})
		}
	}	
	catch (err) {
		console.error(`Error while creating ticket: ${err.message}`)
		next(err)
	}
})

router.put("/:id", async (req, res, next) => {
	try {
		const id = req.params.id
		const {result: isValid, errors} = await ticketValidation.validateTicket(req.body)
		const ticket = await db("tickets").where("id", id)
		if (isValid && ticket.length){
			await db("tickets").where("id", id).update(req.body)
			res.json({message: "Ticket updated successfully!"})	
		}
		else {
			res.status(400).json({status: 400, errors})
		}
	}	
	catch (err) {
		console.error(`Error while updating ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:id", async (req, res, next) => {
	try {
		const id = req.params.id
		const ticket = await db("tickets").where("id", id)
		if (ticket.length){
			await db("tickets").where("id", id).del()
			res.json({message: "Ticket deleted successfully!"})
		}
		else {
			res.status(400).json({status: 400, errors: ["Ticket does not exist"]})
		}
	}
	catch (err){
		console.log(`Error while deleting ticket: ${err.message}`)
		next(err)
	}
})

module.exports = router
