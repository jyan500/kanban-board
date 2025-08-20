/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.createTable("projects_to_boards", (table) => {
 		table.increments("id").primary()	
 		table.integer("project_id").unsigned().notNullable()
 		table.foreign("project_id").references("projects.id").onDelete("cascade")
 		table.integer("board_id").unsigned().notNullable()
 		table.foreign("board_id").references("boards.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
 	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("projects_to_boards") 
};
