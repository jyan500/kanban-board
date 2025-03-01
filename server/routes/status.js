const express = require("express")
const router = express.Router()
const { validateCreate, validateGet, validateUpdate, validateDelete, validateBulkEdit, validateUpdateOrder } = require("../validation/status")
const { handleValidationResult } = require("../middleware/validationMiddleware")
const { batchUpdate } = require("../helpers/functions")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const statuses = await db("statuses").where("organization_id", req.user.organization).select(
			"statuses.id as id",
			"statuses.name as name",
			"statuses.order as order",
			"statuses.organization_id as organizationId",
			"statuses.is_active as isActive",
			"statuses.is_completed as isCompleted"
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
			"statuses.organization_id as organizationId",
			"statuses.is_active as isActive",
			"statuses.is_completed as isCompleted"
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
			is_active: req.body.is_active,
			is_completed: req.body.is_completed,
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
			is_active: req.body.is_active,
			is_completed: req.body.is_completed,
			order: req.body.order,
		})
		res.json({message: "Status updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating status: ${err.message}`)
		next(err)
	}
})

router.post("/update-order", validateUpdateOrder, handleValidationResult, async (req, res, next) => {
	try {
		// we get the updated order for the status that was chosen on the frontend,
		// but we have to find the current status that has this order, and 
		// "swap" places
		let duplicates = new Set()
		req.body.statuses.forEach((status) => {
			if (duplicates.has(status.order)){
				res.json({message: "There was an issue while updating orders."}, 422)
			}
			else {
				duplicates.add(status.order)
			}
		})
		batchUpdate("statuses", req.body.statuses)
		res.json({message: "Status orders updated successfully!"})

	}	
	catch (err){
		console.error(`Error while updating statuses: ${err.message}`)
		next(err)
	}
})

router.post("/bulk-edit", validateBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const isActiveStatusIds = req.body.statuses.filter((status) => status.is_active).map((status) => status.id)
		const isNotActiveStatusIds = req.body.statuses.filter((status) => !status.is_active).map((status) => status.id)
		await db("statuses").whereIn("id", isActiveStatusIds).update({
			is_active: true
		})
		await db("statuses").whereIn("id", isNotActiveStatusIds).update({
			is_active: false
		})
		res.json({message: "Statuses updated successfully!"})
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