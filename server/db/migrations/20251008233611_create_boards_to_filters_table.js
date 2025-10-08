/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("boards_to_filters", (table) => {
        table.increments("id").primary()	
        table.integer("board_id").unsigned()
        table.foreign("board_id").references("boards.id").onDelete("cascade")
        table.integer("filter_id").unsigned()
        table.foreign("filter_id").references("filters.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("boards_to_filters") 
};
