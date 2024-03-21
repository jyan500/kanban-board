const express = require("express")
const router = express.Router()
const statusValidation = require("../validation/status")
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

router.post("/", async (req, res, next) => {
	try {
		const {result: isValid, errors} = await statusValidation.validateStatus(req.body)
		if (isValid){
			const statusId = await db("statuses").insert(req.body)
			res.json({message: `Status inserted successfully!`})
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

router.put("/:id", async (req, res, next) => {
	try {
		const id = req.params.id
		const {result: isValid, errors} = await statusValidation.validateStatus(req.body, id)
		const status = await db("statuses").where("id", id)
		if (isValid && status.length){
			await db("statuses").where("id", id).update(req.body)
			res.json({message: "Status updated successfully!"})	
		}
		else {
			res.status(400).json({status: 400, errors})
		}
	}	
	catch (err) {
		console.error(`Error while updating status: ${err.message}`)
		next(err)
	}
})

router.delete("/:id", async (req, res, next) => {
	try {
		const id = req.params.id
		const status = await db("statuses").where("id", id)
		if (status.length){
			await db("statuses").where("id", id).del()
			res.json({message: "Status deleted successfully!"})
		}
		else {
			res.status(400).json({status: 400, errors: ["Status does not exist"]})
		}
	}
	catch (err){
		console.log(`Error while deleting status: ${err.message}`)
		next(err)
	}
})

module.exports = router