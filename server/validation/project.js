const db = require("../db/db")
const { checkEntityExistsIn, checkUniqueEntity, entityInOrganization, validateKeyExists } = require("./helper")
const { BULK_INSERT_LIMIT, MIN_COLUMN_LIMIT, MAX_COLUMN_LIMIT, MIN_BOARD_TICKET_LIMIT, MAX_BOARD_TICKET_LIMIT } = require("../constants")
const { body, param } = require("express-validator")

const editProjectImageValidator = [
	body("id").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "project", value, "projects")),
	body("image_url").isURL().withMessage("Must be valid URL")
]

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
			body("userId").optional().custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [{col: "user_id", value: value}, {col: "organization_id", value: req.user.organization}], "organization_user_roles"))
		]
	}
	return validationRules
}

const projectBoardValidator = (actionType) => {
	let validationRules = [
		param("projectId").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "project", value, "projects"))
	]
	if (actionType === "create" || actionType === "delete"){
		validationRules = [
			...validationRules,
			body("board_ids.*").custom(async (value, {req}) => await checkEntityExistsIn("board", value, [{
				col: "id",	
				value: value,
			},
			{
				col: "organization_id",	
				value: req.user.organization
			}], "boards"))
		]
	}
	return validationRules
}

module.exports = {
	validateGet: projectValidator("get"),
	validateCreate: projectValidator("create"),
	validateUpdate: projectValidator("update"),
	validateDelete: projectValidator("delete"),
	validateCreateProjectBoard: projectBoardValidator("create"),
	validateDeleteProjectBoard: projectBoardValidator("delete"),
	validateImageUpload: editProjectImageValidator
}
