const db = require("../db/db")
const { checkUniqueEntity, checkEntityExistsIn, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT, MIN_COLUMN_LIMIT, MAX_COLUMN_LIMIT, MIN_BOARD_TICKET_LIMIT, MAX_BOARD_TICKET_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const sprintValidator = (actionType) => {
	let validationRules = [
	]
    if (actionType === "getById"){
        validationRules = [
            ...validationRules,
            param("sprintId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "sprint", value, "sprints"))
        ]
    }

	if (actionType === "create" || actionType === "update"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("name is required"),
			body("description").notEmpty().withMessage("description is required"),
			body("start_date").isISO8601().toDate().withMessage("start_date must be a valid date"),
			body("end_date").isISO8601().toDate().withMessage("end_date must be a valid date"),
			body("user_id").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [{col: "user_id", value: value}, {col: "organization_id", value: req.user.organization}], "organization_user_roles")),
			body("is_completed").isBoolean().withMessage("is_completed must be a boolean"),
		]
	}

	return validationRules
}

const sprintTicketValidator = (actionType) => {
	let validationRules = [
		param("sprintId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "sprint", value, "sprints"))
	]

    if (actionType === "getById"){
		param("ticketId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket", value, "tickets"))
    }

	if (actionType === "update" || actionType === "delete") {
		validationRules = [
			...validationRules,
			body("ticket_ids").isArray({ min: 0, max: BULK_INSERT_LIMIT })
			.withMessage("ticket_ids must be an array")
			.withMessage(`cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("ticket_ids.*")
				.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket", value, "tickets"))
				
		]
		// For create, ensure tickets are not already in this sprint
		if (actionType === "create") {
			validationRules = [
				...validationRules,
				body("ticket_ids.*").custom(async (value, {req}) => await checkUniqueEntity("ticket", value, [
					{"col": "ticket_id", "value": value},
					{"col": "sprint_id", "value": req.params.sprintId}
				], "tickets_to_sprints"))
			]
		}
	}
	return validationRules
}

module.exports = {
	validateSprintGet: sprintValidator("get"),
	validateSprintGetById: sprintValidator("getById"),
	validateSprintCreate: sprintValidator("create"),
	validateSprintUpdate: sprintValidator("update"),
	validateSprintDelete: sprintValidator("delete"),
	validateSprintTicketGet: sprintTicketValidator("get"),
    validateSprintTicketGetById: sprintTicketValidator("getById"),
	validateSprintTicketUpdate: sprintTicketValidator("update"),
	validateSprintTicketDelete: sprintTicketValidator("delete")
}
