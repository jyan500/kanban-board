/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("ticket_comments_to_users", (table) => {
		table.increments("id").primary()
		table.integer("ticket_comment_id").unsigned().notNullable()
		table.integer("user_id").unsigned().notNullable()
		table.foreign("ticket_comment_id").references("ticket_comments.id").onDelete("cascade")
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
	}) 	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("ticket_comments_to_users") 
};
