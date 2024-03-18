const tickets = require("../services/ticket")
const status = require("../services/status")
const priority = require("../services/priority")
const helper = require("../helper")

const validateTicket = async (body) => {
	const keys = new Set(["name", "description", "status_id", "priority_id"])
	const required = new Set(["name", "description", "status_id", "priority_id"])
	const validKeys = helper.validateKeys(body, keys, required)
	if (validKeys){
		try {
			const statusBody = await status.getStatusById(body.status_id)
			const priorityBody = await priority.getPriorityById(body.priority_id)
			if (!statusBody.data.length){
				return {
					result: false,
					errors: [`status of id ${body.status_id} could not be found.`]
				}
			}
			if (!priorityBody.data.length){
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