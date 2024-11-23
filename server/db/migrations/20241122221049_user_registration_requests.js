/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("user_registration_requests", (table) => {
		table.increments("id").primary()	
		table.integer("user_id").unsigned().notNullable()
		table.integer("organization_id").unsigned().notNullable()
		table.integer("org_user_id").unsigned().nullable()
		table.timestamp("approved_at").nullable()
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.foreign("organization_id").references("organizations.id").onDelete("cascade")
		table.foreign("org_user_id").references("organization_user_roles.id").onDelete("cascade")
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("user_registration_requests") 
};
