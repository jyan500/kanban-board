const { BULK_INSERT_LIMIT } = require("../constants")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const db = require("../db/db")
const { body, param } = require("express-validator")

const notificationValidator = (action) => {
	let validationRules = []
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
	validateBulkEdit: notificationValidator("bulk-edit")
}
