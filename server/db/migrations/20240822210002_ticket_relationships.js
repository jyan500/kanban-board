/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("ticket_relationships", (table) => {
		table.increments("id").primary()	
		table.integer("parent_ticket_id").unsigned().notNullable()
		table.integer("child_ticket_id").unsigned().notNullable()
		table.integer("ticket_relationship_type_id").unsigned().notNullable()
		table.foreign("parent_ticket_id").references("tickets.id").onDelete("cascade")
		table.foreign("child_ticket_id").references("tickets.id").onDelete("cascade")
		table.foreign("ticket_relationship_type_id").references("ticket_relationship_types.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("ticket_relationships") 
};
