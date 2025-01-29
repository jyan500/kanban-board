const express = require("express")
const router = express.Router()
const db = require("../db/db")

router.get("/", async (req, res, next) => {
	try {
		let tableName = "";
		switch (req.query.query){
			case "PRIORITY":
				tableName = "priorities"
				break
			case "TICKET_TYPE":
				tableName = "ticket_types"
				break
			case "EPIC":
				tableName = "tickets"
				break
			case "ASSIGNEE":
				tableName = "users"
				break
		}
		const ids = req.query.ids.split(",")
		let elements = []
		if (tableName === "users"){
			elements = await db(tableName).whereIn("id", ids).select("id as id", "first_name", "last_name")
			elements = elements.map((element) => ({...element, name: `${element.first_name} ${element.last_name}`}))
		} else {
			elements = await db(tableName).whereIn("id", ids).select("id as id", "name as name")
		}
		res.json(elements)
	}
	catch (err){
		console.log(`Error while getting ticket types: ${err.message}`)	
		next(err)
	}
})

module.exports = router