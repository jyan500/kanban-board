/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.table("users", (table) => {
		table.string("reset_token")
		table.timestamp("reset_token_expires")
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.table("users", (table) => {
		table.dropColumn("reset_token")
		table.dropColumn("reset_token_expires")
	})
}
