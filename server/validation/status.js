const tickets = require("../services/ticket")
const status = require("../services/status")
const priority = require("../services/priority")
const helper = require("../helper")

const validateStatus = async (body) => {
	const keys = new Set(["name", "order"])
	const required = new Set(["name", "order"])
	const validKeys = helper.validateKeys(body, keys, required)
	if (validKeys){
		try {
			const condition = "WHERE `name` = ? OR `order` = ? "
			const params = [body.name, body.order]
			const statusBody = await status.getStatuses(1, condition, params)
			if (statusBody.data.length){
				return {
					result: false,
					errors: [`name and order fields must be unique.`]
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
	validateStatus
}