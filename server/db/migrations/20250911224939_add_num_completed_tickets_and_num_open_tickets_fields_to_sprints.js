/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.table("sprints", (table) => {
		table.integer("num_completed_tickets").defaultTo(0)
		table.integer("num_open_tickets").defaultTo(0)
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.table("sprints", (table) => {
		table.dropColumn("num_completed_tickets")
		table.dropColumn("num_open_tickets")
	})
}
