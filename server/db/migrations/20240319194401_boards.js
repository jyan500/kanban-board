/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.createTable("boards", (table) => {
 		table.increments("id").primary()	
 		table.string("name").notNullable()
 		table.integer("organization_id").unsigned().notNullable()
 		table.foreign("organization_id").references("organizations.id").onDelete("cascade")
 		table.timestamps(true, true)
 	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("boards") 
};
