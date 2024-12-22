const express = require("express")
const router = express.Router()
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		const notificationTypes = await db("notification_types").select(
			"notification_types.id as id",
			"notification_types.name as name"
		)
		res.json(notificationTypes)
	}
	catch (err){
		console.log(`Error while getting notification types: ${err.message}`)	
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const notificationTypes = await db("notification_types").where("id", req.params.id).select(
			"notification_types.id as id",
			"notification_types.name as name"
		)
		res.json(notificationTypes)
	}	
	catch (err){
		console.log(`Error while getting notification types: ${err.message}`)	
		next(err)
	}
})

module.exports = router