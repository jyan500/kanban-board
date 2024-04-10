const helper = require("../helper")
const db = require("../db/db")
const { checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
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
	if (actionType === "get" || actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("ticketId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket")),
		]
	}
	else if (actionType === "create") {
		validationRules = [
			...validationRules,
			// must be an array of length > 0
			body("ticket_ids").isArray({ min: 0 }).withMessage("tickets_ids must be an array"),
			body("ticket_ids.*")
				.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "ticket", value, "tickets"))
				.custom(async (value, {req}) => await checkUniqueEntity("ticket", "ticket_id", value, "tickets_to_boards"))
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
	validateBoardTicketUpdate: boardTicketValidator("update"),
	validateBoardTicketDelete: boardTicketValidator("delete"),
}
