/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("filters", (table) => {
        table.increments("id").primary()	
        table.string("name")
        table.integer("organization_id").unsigned()
        table.foreign("organization_id").references("organizations.id").onDelete("cascade")
		table.integer("order").unsigned().notNullable()
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("filters") 
};
