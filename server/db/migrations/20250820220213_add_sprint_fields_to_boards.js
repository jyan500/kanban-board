/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("boards", function(table){
		table.text("description").nullable()
		table.boolean("is_sprint").defaultTo(false)
		table.integer("user_id").unsigned().nullable()
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.timestamp("start_date").nullable()
		table.timestamp("end_date").nullable()
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("boards", function(table){
		table.dropColumn("description")
		table.dropColumn("is_sprint")
		table.dropColumn("start_date")
		table.dropColumn("end_date")
		table.dropForeign("user_id")
		table.dropColumn("user_id")
	}) 
};
