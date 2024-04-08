const express = require("express")
const router = express.Router()
const helper = require("../helper")
const { validateCreate, validateUpdate, validateDelete }  = require("../validation/board")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const boards = await db("boards").where("organization_id", req.user.organization)
		res.json(boards)
	}
	catch (err) {
		console.log(`Error while getting boards: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const boards = await db("boards").where("id", req.params.id)
		res.json(boards)
	}	
	catch (err) {
		console.log(`Error while getting Boards: ${err.message}`)	
		next(err)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const body = {...req.body, organization_id: req.user.organization}
		await db("boards").insert({
			name: body.name,
			organization_id: body.organization_id
		})
		res.json({message: "Board inserted successfully!"})
	}	
	catch (err) {
		console.error(`Error while creating Board: ${err.message}`)
		next(err)
	}
})

router.put("/:id", validateUpdate, handleValidationResult, async (req, res, next) => {
	try {
		await db("boards").where("id", req.params.id).update({
			name: req.body.name,
		})
		res.json({message: "Board updated successfully!"})	
	}	
	catch (err) {
		console.error(`Error while updating Board: ${err.message}`)
		next(err)
	}
})

router.delete("/:id", validateDelete, handleValidationResult, async (req, res, next) => {
	try {
		await db("boards").where("id", req.params.id).del()
		res.json({message: "Board deleted successfully!"})
	}
	catch (err){
		console.log(`Error while deleting Board: ${err.message}`)
		next(err)
	}
})

module.exports = router
