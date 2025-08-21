const db = require("../db/db")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT, MIN_COLUMN_LIMIT, MAX_COLUMN_LIMIT, MIN_BOARD_TICKET_LIMIT, MAX_BOARD_TICKET_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const projectValidator = (actionType) => {
	let validationRules = []
	// if update or delete route, validate the ID and make sure ticket exists
	if (actionType === "get" || actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("projectId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "project", value, "projects"))
		]
	}
	if (actionType !== "delete" && actionType !== "get"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("name is required"),
			body("user_id").custom(async (value, {req}) => await checkEntityExistsIn("user", value, [{col: "id", value: value}], "users"))
		]
	}
	return validationRules
}

module.exports = {
	validateGet: projectValidator("get"),
	validateCreate: projectValidator("create"),
	validateUpdate: projectValidator("update"),
	validateDelete: projectValidator("delete"),
}
