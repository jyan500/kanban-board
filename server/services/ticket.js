const db = require("./db")
const helper = require("../helper")
const config = require("../config")

async function getTickets(page=1, condition = "", params = []){
	const baseQuery = 
		"SELECT " + 
		"ticket.id as ticket_id, " + 
		"ticket.name as ticket_name, " +
		"ticket.description as ticket_description, " +
		"status.id as status_id, " + 
		"priority.id as priority_id, " +
		"priority.name as priority_name, " +
		"status.name as status_name, " +
		"priority.order as priority_order, " + 
		"status.order as status_order " + 
		"FROM ticket " + 
		"INNER JOIN priority ON priority.id = ticket.priority_id " + 
		"INNER JOIN status ON status.id = ticket.status_id " 

	const offset = helper.getOffset(page, config.listPerPage)	
	const limit = "LIMIT ?, ? "
	const rows = await db.query(
		baseQuery + condition + limit, [...params, offset, config.listPerPage] 
	)
	let data = helper.emptyOrRows(rows)
	data = data.map((obj) => {
		return {
			id: obj.ticket_id,
			name: obj.ticket_name,
			description: obj.ticket_description,
			status: {
				id: obj.status_id,
				name: obj.status_name,
				order: obj.status_order
			},
			priority: {
				id: obj.priority_id,
				name: obj.priority_name,
				order: obj.priority_order
			}
		}
	})
	const meta = { page }
	return {
		data, 
		meta
	}
}

async function getTicketById(ticketId){
	let conditional = 
	"WHERE ticket.id = ? "
	return await getTickets(1, conditional, [ticketId])
}

async function insertTicket(params = []){
	const result = await db.query(
		"INSERT INTO ticket (name, description, status_id, priority_id) " + 
		"VALUES (?, ?, ?, ?)", params
	)
	let message = "Error in creating ticket"
	if (result.affectedRows){
		message = "Ticket created successfully"
	}

	return { message }

}

async function updateTicket(params = []){
	const result = await db.query(
		"UPDATE TICKET set `name` = ?, description = ?, status_id = ?, priority_id = ? " + 
		"WHERE id = ?", params
	)
	let message = "Error in updating ticket"
	if (result.affectedRows){
		message = "Ticket updated successfully"
	}
	return { message }
}

async function deleteTicket(params = []){
	const result = await db.query(
		"DELETE FROM ticket WHERE id = ?", params
	)
	let message = "Error in deleting ticket"
	if (result.affectedRows){
		message = "Ticket deleted successfully"
	}
	return { message }
}

module.exports = {
	getTickets,
	getTicketById,
	insertTicket,
	updateTicket,
	deleteTicket,
}