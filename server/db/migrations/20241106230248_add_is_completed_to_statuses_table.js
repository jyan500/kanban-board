/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("statuses", function(table){
		table.boolean("is_completed").defaultTo(false)
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("statuses", function(table){
		table.dropColumn("is_completed")
	}) 
};
