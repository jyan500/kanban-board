const express = require("express")
const router = express.Router()
const priority = require("../services/priority")

router.get("/", async (req, res, next) => {
	try {
		res.json(await priority.getPriority(req.query.page))
	}
	catch (err){
		console.log(`Error while getting priority: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		res.json(await priority.getPriorityById(req.params.id))
	}	
	catch (err){
		console.log(`Error while getting priority: ${err.message}`)	
		next(err)
	}
})

module.exports = router