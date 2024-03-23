const helper = require("../helper")
const db = require("../db/db")
const { body, param } = require("express-validator")

const statusValidator = (actionType) => {

	let validationRules = [
		body("name").notEmpty().withMessage("name is required").custom((value, {req}) => {
			return new Promise((resolve, reject) => {
				checkFieldUniqueToStatuses("name", req.body.name, req.body.organization_id, req.params.id).then((res) => {
					if (res){
						resolve(true)
					}
					else {
						reject(new Error("name field must be unique"))
					}
				})
			})
		}),
		body("order").notEmpty().withMessage("order is required").isNumeric().withMessage("order must be a number").custom((value, {req}) => {
				return new Promise((resolve, reject) => {
					checkFieldUniqueToStatuses("order", req.body.order, req.body.organization_id, req.params.id).then((res) => {
						if (res){
							resolve(true)
						}
						else {
							reject(new Error("order field must be unique"))
						}
					})
				})	
		}),
		body("organization_id").notEmpty().withMessage("organization_id is required").custom((value, {req}) => {
			return new Promise((resolve, reject) => {
				db("organizations").where("id", req.body.organization_id).then((res) => {
					if (res?.length === 0){
						reject(new Error(`organization with id ${req.body.organization_id} could not be found`))
					}
					resolve(true)
				})
			})	
		})
	]
	// if update or delete route, validate the ID and make sure status exists
	if (actionType === "update" || actionType === "delete"){
		validationRules = [
			...validationRules,
			param("id").custom((value, {req}) => {
				return new Promise((resolve, reject) => {
					db("statuses").where("id", value).then((res) => {
						if (res?.length === 0){
							reject(new Error(`status with id ${value} does not exist`))
						}
						resolve(true)
					})
				})
			})
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
		console.log(`Error while validating tickets: ${err.message}`)	
	}

}

module.exports = {
	validateCreate: statusValidator("create"),
	validateUpdate: statusValidator("update"),
	validateDelete: statusValidator("delete"),
}