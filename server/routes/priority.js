const express = require("express")
const router = express.Router()
const priority = require("../services/priority")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const priorities = await db("priorities")
		res.json(priorities)
	}
	catch (err){
		console.log(`Error while getting priority: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const priority = await db("priorities").where("id", req.params.id)
		res.json(priority)
	}	
	catch (err){
		console.log(`Error while getting priority: ${err.message}`)	
		next(err)
	}
})

module.exports = router