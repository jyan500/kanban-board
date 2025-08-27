/* collection of shared backend queries across the project */
const db = require("../db/db")

const getAssigneesFromBoards = async (organizationId, boardIds) => {
	return await db("boards")
	.where("organization_id", organizationId)
	.whereIn("boards.id", boardIds)
	.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")
	.join("tickets_to_users", "tickets_to_boards.ticket_id", "=", "tickets_to_users.ticket_id")
	.join("users", "tickets_to_users.user_id", "=", "users.id")
	.groupBy("boards.id")
	.groupBy("tickets_to_users.user_id")
	.groupBy("users.first_name")
	.groupBy("users.last_name")
	.select("boards.id as id", "tickets_to_users.user_id as userId", "users.first_name as firstName", "users.last_name as lastName", "users.image_url as imageUrl")
}

const getNumTicketsFromBoards = async (organizationId, boardIds) => {
	return await db("boards").where("organization_id", organizationId)
	.whereIn("boards.id", boardIds)
	.join("tickets_to_boards", "tickets_to_boards.board_id", "=", "boards.id")
	.groupBy("tickets_to_boards.board_id")
	.count("tickets_to_boards.ticket_id as numTickets")
	.select("tickets_to_boards.board_id as id")
}

module.exports = {
	getAssigneesFromBoards,
	getNumTicketsFromBoards,
}