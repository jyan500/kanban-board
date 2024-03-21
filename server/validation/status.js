const helper = require("../helper")
const db = require("../db/db")

const validateStatus = async (body, id=null) => {
	const keys = new Set(["name", "order", "organization_id"])
	const required = new Set(["name", "order", "organization_id"])
	const validKeys = helper.validateKeys(body, keys, required)
	if (validKeys){
		try {
			const statuses = await db("statuses").where(function(){
				this.where("name", body.name).orWhere("order", body.order)
			}).andWhere("organization_id", body.organization_id)
			if (statuses.length){
				// if there's an ID given, if the other statuses that don't share this ID
				// have the same name or same order as the ones in params, this is not valid
				if (id){
					const filteredStatuses = statuses.filter((status) => status.id !== id)
					if (filteredStatuses.length){
						return {
							result: false,
							errors: [`name and order fields must be unique.`]
						}
					}
					else {
						return {
							result: true,
							errors: []
						}
					}
				}
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