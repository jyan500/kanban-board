const express = require("express")
const router = express.Router()
const tickets = require("../services/ticket")
const helper = require("../helper")
const ticketValidation = require("../validation/tickets")

router.get("/", async (req, res, next) => {
	try {
		res.json(await tickets.getTickets(req.query.page))
	}
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		res.json(await tickets.getTicketById(req.params.id))
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
			const {name, description, status_id: statusId, priority_id: priorityId} = req.body
			res.json(await tickets.insertTicket([
				name,
				description,
				statusId,
				priorityId
			]))
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
		const ticket = await tickets.getTicketById(id)
		if (isValid && ticket.data.length){
			const {name, description, status_id: statusId, priority_id: priorityId} = req.body
			res.json(await tickets.updateTicket([
				name,
				description,
				statusId,
				priorityId,
				id,
			]))	
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
		const ticket = await tickets.getTicketById(id)
		if (ticket.data.length){
			res.json(await tickets.deleteTicket([id]))
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
