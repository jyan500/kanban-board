const db = require("../db/db")
const { checkEntityExistsIn, entityInOrganization } = require("./helper")
const { body, param } = require("express-validator")
const { BULK_INSERT_LIMIT } = require("../constants")

const statusValidator = (actionType) => {
	let validationRules = [
	]
	if (actionType === "update" || actionType === "create"){
		validationRules = [
			...validationRules,
			body("is_active").notEmpty().withMessage("is active is required")
		]	
	}
	// if update or delete route, validate the ID and make sure status exists
	if (actionType === "get" || actionType === "update" || actionType === "delete"){
		validationRules = [
			param("id").custom(async (value, {req}) => await checkEntityExistsIn("status", value, [{col: "id", value: value}, {col: "organization_id", value: req.user.organization}], "statuses"))
		]
	}
	if (actionType !== "delete" && actionType !== "get" && actionType !== "bulk-edit" && actionType !== "update-order"){
		validationRules = [
			...validationRules,
			body("name").notEmpty().withMessage("name is required").custom((value, {req}) => {
				return new Promise((resolve, reject) => {
					checkFieldUniqueToStatuses("name", req.body.name, req.user.organization, req.params.id).then((res) => {
						if (res){
							resolve(true)
						}
						else {
							reject(new Error("Name field must be unique"))
						}
					})
				})
			}),
			body("order").notEmpty().withMessage("order is required").isNumeric().withMessage("order must be a number").custom((value, {req}) => {
					return new Promise((resolve, reject) => {
						checkFieldUniqueToStatuses("order", req.body.order, req.user.organization, req.params.id).then((res) => {
							if (res){
								resolve(true)
							}
							else {
								reject(new Error("Order field must be unique"))
							}
						})
					})	
			}),
		]
	}

	if (actionType === "bulk-edit") {
		validationRules = [
			...validationRules,
			body("statuses").isArray({ min: 0, max: BULK_INSERT_LIMIT })
			.withMessage("statuses must be an array")
			.withMessage(`cannot have more than ${BULK_INSERT_LIMIT} ids`),
			body("statuses.*")
			.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "status", value.id, "statuses"))
		]
	}

	if (actionType === "update-order"){
		validationRules = [
			...validationRules,
			body("statuses").isArray({min: 0, max: 2})
			.withMessage("statuses must be an array")
			.withMessage(`cannot have more than 2 records`),
			body("statuses.*")
			.custom(async (value, {req}) => await entityInOrganization(req.user.organization, "status", value.id, "statuses")),
		]	
	}

	return validationRules
}

const checkFieldUniqueToStatuses = async (fieldName, field, organizationId, id=null) => {

	try {
		const statuses = await db("statuses").where(fieldName, field).andWhere("organization_id", organizationId)
		if (statuses.length){
			// if there's an ID given, if the other statuses that don't share this ID
			// have the same field value as the ones in params, this is not valid
			// for example, if we're trying to update a status to "To-Do", but another status with name To-Do already exists,
			// this is invalid.
			if (id){
				const filteredStatuses = statuses.filter((status) => status.id !== parseInt(id))
				return filteredStatuses.length === 0
			}
			return false
		}
		return true
	}
	catch (err) {
		console.error(`Error while validating statuses: ${err.message}`)	
	}

}

module.exports = {
	validateGet: statusValidator("get"),
	validateCreate: statusValidator("create"),
	validateUpdate: statusValidator("update"),
	validateBulkEdit: statusValidator("bulk-edit"),
	validateDelete: statusValidator("delete"),
	validateUpdateOrder: statusValidator("update-order")
}
