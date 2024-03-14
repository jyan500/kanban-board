const db = require("./db")
const helper = require("../helper")
const config = require("../config")

async function getStatuses(page = 1){
	const offset = helper.getOffset(page, config.listPerPage)
	const rows = await db.query(
		"SELECT `id`, `name`, `order` FROM status LIMIT ?, ?", [offset, config.listPerPage]
	)
	const data = helper.emptyOrRows(rows)
	const meta = { page }

	return {
		data,
		meta
	}
}

module.exports = {
	getStatuses
}