/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("tickets", function(table){
		table.integer("story_points").unsigned()
		table.integer("minutes_spent").unsigned()
		table.timestamp("due_date")
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("tickets", function(table){
		table.dropColumn("story_points")
		table.dropColumn("minutes_spent")
		table.dropColumn("due_date")
	}) 
};
