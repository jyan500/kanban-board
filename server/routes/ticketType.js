const express = require("express")
const router = express.Router()
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const ticketTypes = await db("ticket_types")
		res.json(ticketTypes)
	}
	catch (err){
		console.log(`Error while getting ticket types: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const ticketTypes = await db("ticket_types").where("id", req.params.id)
		res.json(ticketTypes)
	}	
	catch (err){
		console.log(`Error while getting ticket types: ${err.message}`)	
		next(err)
	}
})

module.exports = router