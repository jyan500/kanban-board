/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("tickets", function(table){
		table.integer("story_points").unsigned()
		table.timestamp("due_date").nullable()
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("tickets", function(table){
		table.dropColumn("story_points")
		table.dropColumn("due_date")
	}) 
};
