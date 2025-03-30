/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("user_registration_requests", function(table){
		table.timestamp("denied_at").nullable()
	}) 	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("user_registration_requests", function(table){
		table.dropColumn("denied_at")
	})  
};
