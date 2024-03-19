/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("tickets_to_boards", (table) => {
		table.increments("id").primary()	
		table.integer("ticket_id").unsigned().notNullable()
		table.integer("board_id").unsigned().notNullable()
		table.foreign("ticket_id").references("tickets.id").onDelete("cascade")
		table.foreign("board_id").references("boards.id").onDelete("cascade")
		table.timestamps(true, true)
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("tickets_to_boards") 
};
