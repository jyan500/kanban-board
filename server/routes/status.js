const express = require("express")
const router = express.Router()
const statuses = require("../services/status")

router.get("/", async (req, res, next) => {
	try {
		res.json(await statuses.getStatuses(req.query.page))
	}	
	catch (err) {
		console.log(`Error while getting statuses: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		res.json(await statuses.getStatusById(req.params.id))
	}	
	catch (err){
		console.log(`Error while getting status: ${err.message}`)	
		next(err)
	}
})

module.exports = router