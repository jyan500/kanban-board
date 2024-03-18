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
			res.json(await tickets.insertTicket([
				req.body.name,
				req.body.description,
				req.body.status_id,
				req.body.priority_id,
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

module.exports = router
