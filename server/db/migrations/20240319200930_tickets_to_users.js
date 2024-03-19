/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("tickets_to_users", (table) => {
		table.increments("id").primary()
		table.integer("ticket_id").unsigned().notNullable()
		table.integer("user_id").unsigned().notNullable()
		table.foreign("ticket_id").references("tickets.id").onDelete("cascade")
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.timestamps(true, true)
	}) 	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("tickets_to_users") 
};
