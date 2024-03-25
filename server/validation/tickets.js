const helper = require("../helper")
const db = require("../db/db")
const { validateKeyExists } = require("./helper")
const { body, param } = require("express-validator")

const ticketValidator = (actionType) => {
	let validationRules = []
	// if update or delete route, validate the ID and make sure ticket exists
	if (actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("id").custom(async (value, {req}) => await validateKeyExists("ticket", value, "tickets"))
		]
	}
	if (actionType !== "delete"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("name is required"),
			body("description").notEmpty().withMessage("description is required"),
			body("organization_id").notEmpty().withMessage("organization_id is required").custom(async (value, {req}) => await validateKeyExists("organization", req.body.organization_id, "organizations")),
			body("ticket_type_id").notEmpty().withMessage("ticket_type_id is required").custom(async (value, {req}) => await validateKeyExists("ticket type", req.body.ticket_type_id, "ticket_types")),
			body("status_id").notEmpty().withMessage("status_id is required").custom(async (value, {req}) => await validateKeyExists("status", req.body.status_id, "statuses")),
			body("priority_id").notEmpty().withMessage("priority_id is required").custom(async (value, {req}) => await validateKeyExists("priority", req.body.priority_id, "priorities")),
		]
	}
	return validationRules
}

module.exports = {
	validateCreate: ticketValidator("create"),
	validateUpdate: ticketValidator("update"),
	validateDelete: ticketValidator("delete"),
}
