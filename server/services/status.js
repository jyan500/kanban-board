const db = require("./db")
const helper = require("../helper")
const config = require("../config")

async function getStatuses(page = 1, condition="", params = []){
	const offset = helper.getOffset(page, config.listPerPage)
	const query = "SELECT `id`, `name`, `order` FROM status "
	const limit = "LIMIT ?, ? "
	const rows = await db.query(
		query + condition + limit, [...params, offset, config.listPerPage]
	)
	const data = helper.emptyOrRows(rows)
	const meta = { page }

	return {
		data,
		meta
	}
}

async function getStatusById(statusId){
	const condition = "WHERE `id` = ? "
	const params = [statusId]
	return getStatuses(1, condition, params)
}

async function insertStatus(params=[]){
	const query = "INSERT INTO status (`name`, `order`) VALUES (?, ?)"	
	const result = await db.query(
		query, params
	)
	let message = "Error in creating status"
	if (result.affectedRows){
		message = "Status created successfully"
	}
	return { message }
}

async function updateStatus(params = []){
	const result = await db.query(
		"UPDATE status set `name` = ?, `order` = ? " + 
		"WHERE id = ?", params
	)
	let message = "Error in updating ticket"
	if (result.affectedRows){
		message = "Status updated successfully"
	}
	return { message }
}

async function deleteStatus(params = []){
	const result = await db.query(
		"DELETE FROM status WHERE id = ?", params
	)
	let message = "Error in deleting ticket"
	if (result.affectedRows){
		message = "Status deleted successfully"
	}
	return { message }
}

async function bulkUpdateStatus(params = []){

}

module.exports = {
	getStatuses,
	getStatusById,
	insertStatus,
	updateStatus,
	deleteStatus,
}