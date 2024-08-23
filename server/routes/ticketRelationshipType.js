const express = require("express")
const router = express.Router()
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const ticketRelationshipTypes = await db("ticket_relationship_types").select(
			"ticket_relationship_types.id as id",
			"ticket_relationship_types.name as name"
		)
		res.json(ticketRelationshipTypes)
	}
	catch (err){
		console.log(`Error while getting ticket relationship types: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const ticketRelationshipTypes = await db("ticket_relationship_types").where("id", req.params.id).select(
			"ticket_relationship_types.id as id",
			"ticket_relationship_types.name as name"
		)
		res.json(ticketRelationshipTypes)
	}	
	catch (err){
		console.log(`Error while getting ticket relationship types: ${err.message}`)	
		next(err)
	}
})

module.exports = router