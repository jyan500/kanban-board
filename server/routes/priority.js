const express = require("express")
const router = express.Router()
const priority = require("../services/priority")

router.get("/", async (req, res, next) => {
	try {
		res.json(await priority.getPriority(req.query.page))
	}
	catch (err){
		console.log(`Error while getting statuses: ${err.message}`)	
		next(err)
	}
})

module.exports = router