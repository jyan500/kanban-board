const express = require("express")
const router = express.Router()
const tickets = require("../services/ticket")
const helper = require("../helper")

const validateTicket = (body) => {
	const keys = new Set(["name", "description", "status_id", "priority_id"])
	const required = new Set(["name", "description", "status_id", "priority_id"])
	return helper.validateKeys(body, keys, required)
}

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
		const {result: isValid, errors} = validateTicket(req.body)
		if (isValid){
			// res.json("hello world")
			// res.json(await tickets.createTicket(req.body))
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
