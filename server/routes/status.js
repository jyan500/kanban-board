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

module.exports = router