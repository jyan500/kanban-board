/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("notifications", (table) => {
		table.increments("id").primary()
		table.integer("user_id").unsigned().notNullable()
		table.integer("notification_type_id").unsigned().notNullable()
		table.text("body").notNullable()
		table.boolean("is_read").defaultTo(false)
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
	return knex.schema.dropTableIfExists("notifications") 
};
