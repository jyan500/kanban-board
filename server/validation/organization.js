const db = require("../db/db")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const organizationValidator = (actionType) => {
	let validationRules = [
		body("approve").notEmpty().isBoolean().withMessage("please specify whether to approve or deny."),
	]
	if (actionType === "update"){
		validationRules = [
			...validationRules,
			param("regId").custom(async (value, {req}) => checkEntityExistsIn("user_registration_request", value, [{"col": "id", "value": value}], "user_registration_requests"))
		]
	}
	if (actionType === "bulk-edit") {
		validationRules = [
			...validationRules,
			body("user_registration_request_ids")
			.isArray({min: 0, max: BULK_INSERT_LIMIT})
			.withMessage("user_registration_request_ids must be an array")
			.withMessage(`user_registration_request_ids cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("user_registration_request_ids.*").custom(async (value, {req}) => await checkEntityExistsIn("user_registration_request", value, [{"col": "id", "value": value}], "user_registration_requests"))
		]
	}
	return validationRules
}

module.exports = {
	validateUpdate: organizationValidator("update"),
	validateBulkEdit: organizationValidator("bulk-edit"),
}
