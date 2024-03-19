/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("ticket_types", (table) => {
		table.increments("id").primary()
		table.string("name").notNullable()
		table.timestamps(true, true)
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("ticket_types") 
};
