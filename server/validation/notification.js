const { BULK_INSERT_LIMIT } = require("../constants")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const db = require("../db/db")
const { body, param } = require("express-validator")

const notificationValidator = (action) => {
	let validationRules = []
	if (action === "create"){
		validationRules = [
			...validationRules,
			body("user_id").notEmpty().withMessage("user id is required").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [
				{
					col: "user_id",
					value: value	
				},
				{
					col: "organization_id",
					value: req.user.organization
				}
			])),
			body("body").notEmpty().withMessage("notification message is required"),
			body("notification_type_id").notEmpty().withMessage("notification type is required").custom(async (value, {req}) => await checkEntityExistsIn("notification_types", value, [
				{
					col: "id",
					value: value
				}	
			]))
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
				col: "user_id",
				value: req.user.id	
			},
			], "notifications"))
		]
	}
	return validationRules
}

module.exports = {
	validateBulkEdit: notificationValidator("bulk-edit"),
	validateCreate: notificationValidator("create")
}
