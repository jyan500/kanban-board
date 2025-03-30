/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("tickets", (table) => {
		table.increments("id").primary()
		table.string("name").notNullable()
		table.text("description").notNullable()
		table.integer("priority_id").unsigned().notNullable()
		table.integer("status_id").unsigned().notNullable()
		table.integer("organization_id").unsigned().notNullable()
		table.integer("ticket_type_id").unsigned().notNullable()
		table.foreign("priority_id").references("priorities.id").onDelete("cascade")
		table.foreign("status_id").references("statuses.id").onDelete("cascade")
		table.foreign("organization_id").references("organizations.id").onDelete("cascade")
		table.foreign("ticket_type_id").references("ticket_types.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
	})  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("tickets") 
};
