/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("users", (table) => {
		table.increments("id").primary()
		table.string("first_name").notNullable()
		table.string("last_name").notNullable()
		table.string("email").notNullable()
		table.string("password").notNullable()
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
	})	 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 	return knex.schema.dropTableIfExists("users") 
};
