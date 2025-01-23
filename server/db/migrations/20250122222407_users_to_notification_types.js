/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("users_to_notification_types", (table) => {
		table.increments("id").primary()
		table.integer("user_id").unsigned().notNullable()
		table.integer("notification_type_id").unsigned().notNullable()
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.foreign("notification_type_id").references("notification_types.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
	}) 	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("users_to_notification_types") 
};
