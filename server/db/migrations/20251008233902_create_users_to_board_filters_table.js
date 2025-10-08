/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users_to_board_filters", (table) => {
        table.increments("id").primary()	
        table.integer("user_id").unsigned()
        table.foreign("user_id").references("users.id").onDelete("cascade")
        table.integer("board_filter_id").unsigned()
        table.foreign("board_filter_id").references("boards_to_filters.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("users_to_board_filters") 
};
