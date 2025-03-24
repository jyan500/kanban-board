/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.table("users", (table) => {
		table.string("activation_token")
		table.timestamp("activation_token_expires")
		table.boolean("is_active").defaultTo(false)
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.table("users", (table) => {
		table.dropColumn("activation_token");
		table.dropColumn("activation_token_expires");
		table.dropColumn("is_active");
	})
}
