const db = require("./db")
const helper = require("../helper")
const config = require("../config")

async function getPriority(page=1, condition = "", params = []){
	const offset = helper.getOffset(page, config.listPerPage)
	const query = "SELECT `id`, `name`, `order` FROM priority "
	const limit = "LIMIT ?, ? "
	const rows = await db.query(query + condition + limit, [...params, offset, config.listPerPage])
	const data = helper.emptyOrRows(rows)
	const meta = {page}
	return {
		data, meta
	}
}

async function getPriorityById(priorityId){
	const condition = "WHERE `id` = ? "
	const params = [priorityId]
	return getPriority(1, condition, params)
}

module.exports = {
	getPriority,
	getPriorityById,
}