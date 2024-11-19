/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("tickets_to_users", function(table){
		table.boolean("is_watcher").defaultTo(false)
	}) 	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("tickets_to_users", function(table){
		table.dropColumn("is_watcher")
	})  
};
