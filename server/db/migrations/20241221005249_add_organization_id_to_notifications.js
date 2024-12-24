/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("notifications", function(table){
		table.integer("organization_id").unsigned()
		table.foreign("organization_id").references("organizations.id").onDelete("cascade")
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("notifications", function(table){
		table.dropForeign("organization_id")
		table.dropColumn("organization_id")
	}) 
};
