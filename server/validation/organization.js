const db = require("../db/db")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const registrationRequestValidator = (actionType) => {
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

const organizationValidator = (actionType) => {
	let validationRules = [
		param("id").notEmpty().withMessage("id must be specified").custom(async (value, {req}) => checkEntityExistsIn("organization", value, [{"col": "id", "value": value}], "organizations")),
	]	
	if (actionType === "update"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("organization name is required"),
			body("email").isEmail().withMessage("please enter a valid email"),
			body("phone_number").isMobilePhone().withMessage("please enter valid phone number"),
		]
	}

	return validationRules
}

module.exports = {
	validateUpdate: registrationRequestValidator("update"),
	validateBulkEdit: registrationRequestValidator("bulk-edit"),
	validateUpdateOrganization: organizationValidator("update")
}
