/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("users", function(table){
		table.boolean("is_dark_mode").defaultTo(false)
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("users", function(table){
		table.dropColumn("is_dark_mode")
	}) 
};
