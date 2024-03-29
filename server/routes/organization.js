const express = require("express")
const router = express.Router()
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const organizations = await db("organizations")
		res.json(organizations)
	}
	catch (err){
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const organizations = await db("organizations").where("id", req.params.id)
		res.json(organizations)
	}	
	catch (err){
		console.log(`Error while getting organizations: ${err.message}`)	
		next(err)
	}
})

module.exports = router