const db = require("../db/db")
const { checkUniqueEntity, checkEntityExistsIn, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT, MIN_COLUMN_LIMIT, MAX_COLUMN_LIMIT, MIN_BOARD_TICKET_LIMIT, MAX_BOARD_TICKET_LIMIT } = require("../constants")
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
			body("ticket_limit").isNumeric().withMessage("ticket limit must be a number").isFloat({min: MIN_BOARD_TICKET_LIMIT, max: MAX_BOARD_TICKET_LIMIT}).withMessage(`ticket limit must be between ${MIN_BOARD_TICKET_LIMIT} and ${MAX_BOARD_TICKET_LIMIT}`),
			body("user_id").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [{col: "user_id", value: value}, {col: "organization_id", value: req.user.organization}], "organization_user_roles")),
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
	else if (actionType === "create" || actionType === "bulk-delete") {
		validationRules = [
			...validationRules,
			// must be an array of length > 0
			body("ticket_ids").isArray({ min: 0, max: BULK_INSERT_LIMIT })
			.withMessage("tickets_ids must be an array")
			.withMessage(`cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("ticket_ids.*")
				.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket", value, "tickets"))
				
		]		
		if (actionType === "create"){
			validationRules = [
				...validationRules,
				body("ticket_ids.*")
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
	}
	return validationRules
}

const boardStatusValidator = (actionType) => {
	let validationRules = [
		param("boardId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards"))
	]	
	if (actionType === "get" || actionType === "delete" || actionType === "update"){
		validationRules = [
			...validationRules,
			param("statusId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "status", value, "statuses"))
		]
	}
	if (actionType === "update"){
		validationRules = [
			...validationRules,	
			body("limit").isNumeric().withMessage("limit must be a number").isFloat({min: MIN_COLUMN_LIMIT, max: MAX_COLUMN_LIMIT}).withMessage(`limit must be between ${MIN_COLUMN_LIMIT} and ${MAX_COLUMN_LIMIT}`)
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

const boardProjectValidator = (actionType) => {
	let validationRules = [
		param("boardId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards")),
	]
	if (actionType === "update") {
		validationRules = [
			...validationRules,
			// must be an array of length > 0
			body("ids").isArray({ max: BULK_INSERT_LIMIT })
			.withMessage("ids must be an array")
			.withMessage(`cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("ids.*")
				.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "project", value, "projects"))
				
		]		
	}
	return validationRules
}

const boardSprintValidator = (actionType) => {
	let validationRules = [
		param("boardId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards"))
	]

	if (actionType === "getById"){
		validationRules = [
			...validationRules,
			param("sprintId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "sprint", value, "sprints")),
		]
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
	validateBoardTicketBulkDelete: boardTicketValidator("bulk-delete"),
	validateBoardStatusGet: boardStatusValidator("get"),
	validateBoardStatusCreate: boardStatusValidator("create"),
	validateBoardStatusDelete: boardStatusValidator("delete"),
	validateBoardStatusUpdate: boardStatusValidator("update"),
	validateBoardStatusBulkEdit: boardStatusValidator("bulk-edit"),
	validateBoardProjectsGet: boardProjectValidator("get"),
	validateBoardProjectsUpdate: boardProjectValidator("update"),
	validateBoardSprintGet: boardSprintValidator("get"),
	validateBoardSprintGetById: boardSprintValidator("getById"),
}
