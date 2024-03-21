const helper = require("../helper")
const db = require("../db/db")

const validateTicket = async (body) => {
	const keys = new Set(["name", "description", "status_id", "priority_id", "ticket_type_id", "organization_id"])
	const required = new Set(["name", "description", "status_id", "priority_id", "ticket_type_id", "organization_id"])
	const validKeys = helper.validateKeys(body, keys, required)
	if (validKeys){
		try {
			const status = await db("statuses").where("id", body.status_id)
			const ticket_type = await db("ticket_types").where("id", body.ticket_type_id)
			const priority = await db("priorities").where("id", body.priority_id)
			const organization = await db("organizations").where("id", body.organization_id)
			if (!status.length){
				return {
					result: false,
					errors: [`status of id ${body.status_id} could not be found.`]
				}
			}
			if (!priority.length){
				return {
					result: false,
					errors: [`priority of id ${body.priority_id} could not be found.`]
				}
			}
			if (!ticket_type.length){
				return {
					result: false,
					errors: [`priority of id ${body.priority_id} could not be found.`]
				}
			}
			if (!organization.length){
				return {
					result: false,
					errors: [`priority of id ${body.priority_id} could not be found.`]
				}
			}
			return {
				result: true,
				errors: []
			}
		}
		catch (err) {
			console.log(`Error while validating tickets: ${err.message}`)	
		}
	}
	return validKeys
}

module.exports = {
	validateTicket
}