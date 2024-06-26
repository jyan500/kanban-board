const express = require("express")
const router = express.Router()
const { validateCreate, validateGet, validateUpdate, validateDelete } = require("../validation/status")
const { handleValidationResult } = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const statuses = await db("statuses").where("organization_id", req.user.organization).select(
			"statuses.id as id",
			"statuses.name as name",
			"statuses.order as order",
			"statuses.organization_id as organizationId"
		)
		res.json(statuses)
	}	
	catch (err) {
		console.log(`Error while getting statuses: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const statuses = await db("statuses").where("id", req.params.id).select(
			"statuses.id as id",
			"statuses.name as name",
			"statuses.order as order",
			"statuses.organization_id as organizationId"
		)
		res.json(statuses)
	}	
	catch (err){
		console.log(`Error while getting status: ${err.message}`)	
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		const id = await db("statuses").insert({
			name: body.name,
			order: body.order,
			organization_id: body.organization_id
		}, ["id"])
		res.json({id: id[0], message: `Status inserted successfully!`})
	}	
	catch (err){
		console.log(`Error while inserting status: ${err.message}`)	
		next(err)
	}
})

router.put("/:id", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("statuses").where("id", req.params.id).update({
			name: req.body.name,
			order: req.body.order
		})
		res.json({message: "Status updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating status: ${err.message}`)
		next(err)
	}
})

router.delete("/:id", validateDelete, handleValidationResult, async (req, res, next) => {
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