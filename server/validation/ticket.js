const db = require("../db/db")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const ticketValidator = (actionType) => {
	let validationRules = []
	// if update or delete route, validate the ID and make sure ticket exists
	if (actionType === "get" || actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("ticketId").custom(async (value, {req}) => await checkEntityExistsIn("ticket", value, [{
				col: "id",
				value: value
			},
			{
				col: "organization_id", 
				value: req.user.organization
			}
			], "tickets"))
		]
	}
	if (actionType !== "delete" && actionType !== "get"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("name is required"),
			body("description").notEmpty().withMessage("description is required"),
			body("ticket_type_id").notEmpty().withMessage("ticket_type_id is required").custom(async (value, {req}) => await checkEntityExistsIn("ticket type", value, [{col: "id", value: value}], "ticket_types")),
			body("status_id").notEmpty().withMessage("status_id is required").custom(async (value, {req}) => await checkEntityExistsIn("status", value, [{"col": "id", "value": value}], "statuses")),
			body("priority_id").notEmpty().withMessage("priority_id is required").custom(async (value, {req}) => await checkEntityExistsIn("priority", value, [{"col": "id", "value": value}], "priorities")),
		]
	}
	return validationRules
}

const ticketUserValidator = (actionType) => {
	let validationRules = [
		param("ticketId").custom(async (value, {req}) => await checkEntityExistsIn("ticket", req.params.ticketId, [{
			col: "id", 
			value: req.params.ticketId 
		},
		{
			col: "organization_id",
			value: req.user.organization
		}], "tickets"))
	]

	if (actionType === "get" || actionType === "delete") {
		validationRules = [
			...validationRules, 
			param("userId").custom(async (value, {req}) => await checkEntityExistsIn("user", value, [{
				col: "user_id",
				value: value	
			},
			{
				col: "organization_id",
				value: req.user.organization
			}
			], "organization_user_roles")),
		]	
	}
	else if (actionType === "create") {
		validationRules = [
			...validationRules,
			body("user_ids.*")
			.isArray({min: 0, max: BULK_INSERT_LIMIT})
			.withMessage("user_ids must be an array")
			.withMessage(`user_ids cannot have more than ${BULK_INSERT_LIMIT} ids`).custom(async (value, {req}) => await checkUniqueEntity("user", value, [
			{
				"col": "user_id",
				"value": value,
			},
			{
				"col": "ticket_id",
				"value": req.params.ticketId
			}
			], "tickets_to_users")).custom(async (value, {req}) => await checkEntityExistsIn("user", value, [{
				col: "user_id",
				value: value	
			},
			{
				col: "organization_id",
				value: req.user.organization
			}], "organization_user_roles"))
		]
	}
	return validationRules
}

module.exports = {
	validateGet: ticketValidator("get"),
	validateCreate: ticketValidator("create"),
	validateUpdate: ticketValidator("update"),
	validateDelete: ticketValidator("delete"),
	validateTicketUserGet: ticketUserValidator("get"),
	validateTicketUserCreate: ticketUserValidator("create"),
	validateTicketUserDelete: ticketUserValidator("delete"),
}
