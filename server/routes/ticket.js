const express = require("express")
const router = express.Router()
const tickets = require("../services/ticket")

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
		res.json("hello world")
	}	
	catch (err) {
		console.log(`Error while getting tickets: ${err.message}`)	
		next(err)
	}
})

module.exports = router
