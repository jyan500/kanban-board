const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { validateBulkEdit } = require("../validation/notification")
const { handleValidationResult }  = require("../middleware/validationMiddleware")

// get all notifications for the logged in user
router.get("/", async (req, res, next) => {
	try {
		const userId = req.user.id
		const notifications = await db("notifications")
		.where("user_id", userId)
		.select(
			"id as id", 
			"body as body", 
			"notification_type_id as notificationTypeId",
			"user_id as userId",
			"is_read as isRead",
			"created_at as createdAt",
		).orderBy("created_at", "desc")
		res.json(notifications)
	}
	catch (err){
		console.error(`There was an error while getting notifications: ${err}`)
	}
})

/* poll for new unread notifications */
router.get("/poll", async (req, res, next) => {
	try {
		const userId = req.user.id
		const timeout = 30000
		const pollInterval = 1000

		let hasNewNotifications = false

		// poll the database based on the pollInterval  
		const interval = setInterval(async () => {
			const notifications = await db("notifications")
			.where("user_id", userId)
			.where("is_read", false)
			.select(
				"id as id", 
				"body as body", 
				"notification_type_id as notificationTypeId",
				"is_read as isRead",
				"user_id as userId",
				"created_at as createdAt",
			).orderBy("created_at", "desc")
			if (notifications?.length){
				hasNewNotifications = true
				clearInterval(interval)
				res.status(200).json(notifications)
			}
		}, pollInterval)

		// if there are no new notifications after the timeout threshold,
		// timeout and send no content
		setTimeout(() => {
			if (!hasNewNotifications){
				clearInterval(interval)
				res.status(204).send()
			}	
		}, timeout)
	}
	catch (err){
		console.error(`There was an error while getting notifications: ${err}`)
	}	
})

router.post("/bulk-edit", validateBulkEdit, handleValidationResult, async (req, res, next) => {
	try {
		const notificationIds = req.body.ids	
		await db("notifications").whereIn("id", notificationIds).update({is_read: req.body.is_read})
		res.json({message: "Notifications have been updated!"})
	}
	catch (err){
		console.error(`There was an error while updating notification: ${err}`)
	}
})

router.put("/:notificationId", async (req, res, next) => {
	try {
		const notificationId = req.params.notificationId	
		await db("notifications").where("id", notificationId).update({is_read: req.body.is_read})
		res.json({message: "Notification has been updated!"})
	}
	catch (err){
		console.error(`There was an error while updating notification: ${err}`)
	}
})

module.exports = router


