const db = require("../db/db")
const { checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const boardValidator = (actionType) => {
	let validationRules = []
	// if update or delete route, validate the ID and make sure ticket exists
	if (actionType === "get" || actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("boardId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards"))
		]
	}
	if (actionType !== "delete" && actionType !== "get"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("name is required"),
		]
	}
	return validationRules
}

const boardTicketValidator = (actionType) => {
	let validationRules = [
		param("boardId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards"))
	]
	if (actionType === "get" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("ticketId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket", value, "tickets")),
		]
	}
	else if (actionType === "create") {
		validationRules = [
			...validationRules,
			// must be an array of length > 0
			body("ticket_ids").isArray({ min: 0, max: BULK_INSERT_LIMIT })
			.withMessage("tickets_ids must be an array")
			.withMessage(`cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("ticket_ids.*")
				.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket", value, "tickets"))
				.custom(async (value, {req}) => await checkUniqueEntity("ticket", value, [{
					"col": "ticket_id",
					"value": value,
				},
				{
					"col": "board_id",
					"value": req.params.boardId
				}
				],"tickets_to_boards"))
		]		
	}
	return validationRules
}

const boardStatusValidator = (actionType) => {
	let validationRules = [
		param("boardId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards"))
	]	
	if (actionType === "get" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("statusId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "status", value, "statuses"))
		]
	}
	else if (actionType === "create" || actionType === "bulk-edit") {
		validationRules = [
			...validationRules,
			body("status_ids").isArray({ min: 0, max: BULK_INSERT_LIMIT })
			.withMessage("status_ids must be an array")
			.withMessage(`cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("status_ids.*")
			.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "status", value, "statuses"))

			
		]
		if (actionType === "create"){
			validationRules = [
				...validationRules,
				body("status_ids.*").custom(async (value, {req}) => await checkUniqueEntity("status", value, [{
					"col": "status_id",
					"value": value,
				},
				{
					"col": "board_id",	
					"value": req.params.boardId
				}
				], "boards_to_statuses"))
			]
		}
	}
	return validationRules
}

module.exports = {
	validateGet: boardValidator("get"),
	validateCreate: boardValidator("create"),
	validateUpdate: boardValidator("update"),
	validateDelete: boardValidator("delete"),
	validateBoardTicketGet: boardTicketValidator("get"),
	validateBoardTicketCreate: boardTicketValidator("create"),
	validateBoardTicketDelete: boardTicketValidator("delete"),
	validateBoardStatusGet: boardStatusValidator("get"),
	validateBoardStatusCreate: boardStatusValidator("create"),
	validateBoardStatusDelete: boardStatusValidator("delete"),
	validateBoardStatusBulkEdit: boardStatusValidator("bulk-edit"),
}
