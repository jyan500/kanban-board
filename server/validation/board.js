const helper = require("../helper")
const db = require("../db/db")
const { entityInOrganization, validateKeyExists } = require("./helper")
const { body, param } = require("express-validator")

const boardValidator = (actionType) => {
	let validationRules = []
	// if update or delete route, validate the ID and make sure ticket exists
	if (actionType === "get" || actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("id").custom(async (value, {req}) => await entityInOrganization(req.user.organization, "board", value, "boards"))
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

module.exports = {
	validateGet: boardValidator("get"),
	validateCreate: boardValidator("create"),
	validateUpdate: boardValidator("update"),
	validateDelete: boardValidator("delete"),
}
