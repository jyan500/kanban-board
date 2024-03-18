const express = require("express")
const router = express.Router()
const statuses = require("../services/status")
const statusValidation = require("../validation/status")

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

router.post("/", async (req, res, next) => {
	try {
		const {result: isValid, errors} = await statusValidation.validateStatus(req.body)
		if (isValid){
			res.json(await statuses.insertStatus([
				req.body.name,
				req.body.order
			]))
		}
		else {
			res.status(400).json({status: 400, errors})
		}
	}	
	catch (err){
		console.log(`Error while inserting status: ${err.message}`)	
		next(err)
	}
})

module.exports = router