const express = require("express")
const router = express.Router()
const { validateCreate, validateUpdate, validateDelete } = require("../validation/status")
const { showValidationMessageIfError } = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const statuses = await db("statuses")
		res.json(statuses)
	}	
	catch (err) {
		console.log(`Error while getting statuses: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const statuses = await db("statuses").where("id", req.params.id)
		res.json(statuses)
	}	
	catch (err){
		console.log(`Error while getting status: ${err.message}`)	
		next(err)
	}
})

router.post("/", validateCreate, showValidationMessageIfError, async (req, res, next) => {
	try {
		const statusId = await db("statuses").insert(req.body)
		res.json({message: `Status inserted successfully!`})
	}	
	catch (err){
		console.log(`Error while inserting status: ${err.message}`)	
		next(err)
	}
})

router.put("/:id", validateUpdate, showValidationMessageIfError, async (req, res, next) => {
	try {
		await db("statuses").where("id", req.params.id).update(req.body)
		res.json({message: "Status updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating status: ${err.message}`)
		next(err)
	}
})

router.delete("/:id", validateDelete, showValidationMessageIfError, async (req, res, next) => {
	try {
		await db("statuses").where("id", req.params.id).del()
		res.json({message: "Status deleted successfully!"})
	}
	catch (err){
		console.log(`Error while deleting status: ${err.message}`)
		next(err)
	}
})

module.exports = router