const { BULK_INSERT_LIMIT } = require("../constants")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const db = require("../db/db")
const { body, query, param, check } = require("express-validator")

const notificationValidator = (action) => {
	let validationRules = []
	if (action === "get"){
		validationRules = [
			...validationRules,
			check("dateFrom").optional().isISO8601().withMessage("dateFrom must be a date"),
			check("dateTo").optional().isISO8601().withMessage("dateTo must be a date")
		]
	}
	if (action === "create"){
		validationRules = [
			...validationRules,
			body("sender_id").notEmpty().withMessage("sender_id is required").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [
				{
					col: "user_id",
					value: value	
				},
				{
					col: "organization_id",
					value: req.user.organization
				}
			], "organization_user_roles")),
			body("recipient_id").notEmpty().withMessage("recipient_id is required").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [
				{
					col: "user_id",
					value: value	
				},
				{
					col: "organization_id",
					value: req.user.organization
				}
			], "organization_user_roles")),
			body("ticket_id").optional().custom(async (value, {req}) => await checkEntityExistsIn("tickets", value, [
				{
					col: "id",
					value: value
				},
				{
					col: "organization_id",
					value: req.user.organization
				}	
			], "tickets")),
			body("notification_type_id").notEmpty().withMessage("notification type is required").custom(async (value, {req}) => await checkEntityExistsIn("notification_types", value, [
				{
					col: "id",
					value: value
				}	
			], "notification_types"))
		]
	}
	if (action === "bulk-edit"){
		validationRules = [
			...validationRules,
			body("ids")
			.isArray({min: 0, max: BULK_INSERT_LIMIT})
			.withMessage("ids must be an array")
			.withMessage(`ids cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("ids.*").custom(async (value, {req}) => await checkEntityExistsIn("user", value, [
			{
				col: "id",
				value: value,
			},
			{
				col: "recipient_id",
				value: req.user.id	
			},
			], "notifications"))
		]
	}
	if (action === "bulk-create"){
		validationRules = [
			...validationRules,	
			body("notifications").isArray({min: 0, max: BULK_INSERT_LIMIT})
			.withMessage("notifications must be an array")
			.withMessage(`notifications cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("notifications.*.sender_id").notEmpty().withMessage("sender_id is required").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [
				{
					col: "user_id",
					value: value	
				},
				{
					col: "organization_id",
					value: req.user.organization
				}
			], "organization_user_roles")),
			body("notifications.*.recipient_id").notEmpty().withMessage("recipient_id is required").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [
				{
					col: "user_id",
					value: value	
				},
				{
					col: "organization_id",
					value: req.user.organization
				}
			], "organization_user_roles")),
			body("notifications.*.ticket_id").optional().custom(async (value, {req}) => await checkEntityExistsIn("tickets", value, [
				{
					col: "id",
					value: value
				},
				{
					col: "organization_id",
					value: req.user.organization
				}	
			], "tickets")),
			body("notifications.*.notification_type_id").notEmpty().withMessage("notification type is required").custom(async (value, {req}) => await checkEntityExistsIn("notification_types", value, [
				{
					col: "id",
					value: value
				}	
			], "notification_types"))
		]
	}
	return validationRules
}

module.exports = {
	validateGet: notificationValidator("get"),
	validateBulkEdit: notificationValidator("bulk-edit"),
	validateBulkCreate: notificationValidator("bulk-create"),
	validateCreate: notificationValidator("create")
}
