/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("notifications", function(table){
		table.renameColumn("user_id", "recipient_id")
		table.string("object_link").nullable()
		table.integer("sender_id").unsigned()
		table.foreign("sender_id").references("users.id").onDelete("cascade")
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("notifications", function(table){
		table.renameColumn("recipient_id", "user_id")
		table.dropColumn("object_link")
		table.dropForeign("sender_id")
		table.dropColumn("sender_id")
	}) 
};
