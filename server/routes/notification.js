const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { validateGet, validateCreate, validateBulkCreate, validateBulkEdit } = require("../validation/notification")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { getNotificationBody } = require("../helpers/functions")
const { DEFAULT_PER_PAGE } = require("../constants")

// get all notifications for the logged in user
router.get("/", validateGet, handleValidationResult, async (req, res, next) => {
	try {
		const userId = req.user.id
		const notifications = await db("notifications")
		.where("recipient_id", userId)
		.where("organization_id", req.user.organization)
		.modify((queryBuilder) => {
			if (req.query.query){
				queryBuilder.whereILike("body", `%${req.query.query}%`)
			}
			if (req.query.dateFrom){
				queryBuilder.whereRaw("DATE(created_at) >= ?", [req.query.dateFrom])
			}
			if (req.query.dateTo){
				queryBuilder.whereRaw("DATE(created_at) <= ?", [req.query.dateTo])
			}	
			if (req.query.userId){
				queryBuilder.where("sender_id", req.query.userId)
			}
			if (req.query.notificationType){
				queryBuilder.where("notification_type_id", req.query.notificationType)
			}
			if (req.query.isUnread === "true"){
				queryBuilder.where("is_read", false)
			}
		})
		.select(
			"id as id", 
			"body as body", 
			"notification_type_id as notificationTypeId",
			"sender_id as senderId", 
			"object_link as objectLink",
			"recipient_id as recipientId",
			"is_read as isRead",
			"created_at as createdAt",
		).orderBy("created_at", "desc")
		.paginate({ perPage: req.query.perPage ?? DEFAULT_PER_PAGE, currentPage: req.query.page ? parseInt(req.query.page) : 1, isLengthAware: true});
		res.json(notifications)
	}
	catch (err){
		console.error(`There was an error while getting notifications: ${err}`)
	}
})

router.post("/", validateCreate, handleValidationResult, async (req, res, next) => {
	try {
		const notificationType = await db("notification_types").where("id", req.body.notification_type_id).first()
		// check if recipient user has the notification type on their settings
		const userNotificationType = await db("users_to_notification_types").where("notification_type_id", notificationType?.id).where("user_id", req.body.recipient_id).first()
		if (userNotificationType){
			const body = await getNotificationBody(notificationType, req.body)
			await db("notifications").insert({
				recipient_id: req.body.recipient_id,
				sender_id: req.body.sender_id,
				notification_type_id: req.body.notification_type_id,
				organization_id: req.user.organization,
				body: body,
				object_link: req.body.object_link,
				is_read: false
			})
		}
		res.json({message: "Notification was created successfully!"})
	}
	catch (err){
		console.error(`There was an error while creating notifications: ${err}`)
	}
})

router.post("/bulk-create", validateBulkCreate, handleValidationResult, async (req, res, next) => {
	try {
		const notifications = await Promise.all(req.body.notifications.map(async (obj) => {
			const notificationType = await db("notification_types").where("id", obj.notification_type_id).first()
			// check if recipient user has the notification type on their settings
			const userNotificationType = await db("users_to_notification_types").where("notification_type_id", notificationType?.id).where("user_id", obj.recipient_id).first()
			if (userNotificationType){
				const body = await getNotificationBody(notificationType, obj)
				return {
					recipient_id: obj.recipient_id,
					sender_id: obj.sender_id,
					notification_type_id: obj.notification_type_id,
					organization_id: req.user.organization,
					body: body,
					object_link: obj.object_link,
					is_read: false
				}
			}
		}))
		const filtered = notifications.filter((notification) => notification != null)
		if (filtered.length){
			await db("notifications").insert(notifications)
		}
		res.json({message: "Notification created successfully!"})
	}
	catch (err){
		console.error(`There was an error while creating notifications: ${err}`)
	}
})

/* poll for new unread notifications */
router.get("/poll", async (req, res, next) => {
	try {
		const userId = req.user.id
		// check only for new unread notifications
		const notifications = await db("notifications")
		.where("recipient_id", userId)
		.where("organization_id", req.user.organization)
		.where("is_read", false)
		.modify((queryBuilder) => {
			if (!isNaN(Number(req.query.lastId))){
				queryBuilder.where("id", ">", Number(req.query.lastId))
			}
		})
		.select(
			"id as id", 
			"body as body", 
			"notification_type_id as notificationTypeId",
			"is_read as isRead",
			"sender_id as senderId",
			"object_link as objectLink",
			"recipient_id as recipientId",
			"created_at as createdAt",
		).orderBy("created_at", "desc")
		res.status(200).json(notifications)
	// 	const timeout = 30000
	// 	const pollInterval = 1000

	// 	let hasNewNotifications = false
	// 	// poll the database based on the pollInterval  
	// 	const interval = setInterval(async () => {
	// 		const notifications = await db("notifications")
	// 		.where("recipient_id", userId)
	// 		.where("organization_id", req.user.organization)
	// 		.where("is_read", false)
	// 		.modify((queryBuilder) => {
	// 			if (!isNaN(Number(req.query.lastId))){
	// 				queryBuilder.where("id", ">", Number(req.query.lastId))
	// 			}
	// 		})
	// 		.select(
	// 			"id as id", 
	// 			"body as body", 
	// 			"notification_type_id as notificationTypeId",
	// 			"is_read as isRead",
	// 			"sender_id as senderId",
	// 			"object_link as objectLink",
	// 			"recipient_id as recipientId",
	// 			"created_at as createdAt",
	// 		).orderBy("created_at", "desc")
	// 		if (notifications?.length){
	// 			hasNewNotifications = true
	// // 			clearInterval(interval)
	// 			res.status(200).json(notifications)
	// 		}
	// 	}, pollInterval)

	// 	// if there are no new notifications after the timeout threshold,
	// 	// timeout and send no content
	// 	setTimeout(() => {
	// 		if (!hasNewNotifications){
	// 			clearInterval(interval)
	// 			res.status(204).send()
	// 		}	
	// 	}, timeout)
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
		next(err)
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
		next(err)
	}
})

module.exports = router


