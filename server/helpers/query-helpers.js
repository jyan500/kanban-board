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
	.groupBy("users.image_url")
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

const getLastModified = (queryBuilder) => {
	return queryBuilder.leftJoin("tickets_to_boards","tickets_to_boards.board_id", "=", "boards.id")
	.leftJoin("boards_to_statuses","boards_to_statuses.board_id", "=", "boards.id")
	.max("tickets_to_boards.updated_at as ticketsUpdatedAt")
	.max("boards_to_statuses.updated_at as boardStatusesUpdatedAt")
	.groupBy("boards.id")
	.groupBy("boards.ticket_limit")
	.groupBy("boards.name")
	.groupBy("boards.organization_id")
	.select(
		"boards.updated_at as boardUpdatedAt",
	)
}

const searchTicketByAssignee = (queryBuilder, query) => {
	const terms = query.trim().split(/\s+/)
	return queryBuilder.join("tickets_to_users", "tickets_to_users.ticket_id", "=", "tickets.id")
	.join("users", "tickets_to_users.user_id", "=", "users.id")
	.where("tickets_to_users.is_mention", false)
	.where("tickets_to_users.is_watcher", false)
	.modify((queryBuilder2) =>
		terms.forEach((term) => {
			queryBuilder2.where((qb) => {
				qb.whereILike("users.first_name", `%${term}%`)
				.orWhereILike("users.last_name", `%${term}%`)
			})
		})
	)
}

const searchTicketByReporter = (queryBuilder, query) => {
	const terms = query.trim().split(/\s+/)
	return queryBuilder.join("users", "users.id", "=", "tickets.user_id")
	.modify((queryBuilder2) => 
		terms.forEach((term) => {
			queryBuilder2.where((qb) => {
				qb.whereILike("users.first_name", `%${term}%`)
				.orWhereILike("users.last_name", `%${term}%`)
			})
		})
	)
}

module.exports = {
	getAssigneesFromBoards,
	getNumTicketsFromBoards,
	getLastModified,
	searchTicketByAssignee,
	searchTicketByReporter,
}
