const express = require("express")
const router = express.Router()
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const priorities = await db("priorities").select(
			"priorities.id as id",
			"priorities.name as name",
			"priorities.order as order",
		)
		res.json(priorities)
	}
	catch (err){
		console.error(`Error while getting priority: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const priority = await db("priorities").where("id", req.params.id).select(
			"priorities.id as id",
			"priorities.name as name",
			"priorities.order as order",
		)
		res.json(priority)
	}	
	catch (err){
		console.error(`Error while getting priority: ${err.message}`)	
		next(err)
	}
})

module.exports = router