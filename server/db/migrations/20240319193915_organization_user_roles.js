/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable("organization_user_roles", (table) => {
		table.increments("id").primary()
		table.integer("user_id").unsigned().notNullable()
		table.integer("organization_id").unsigned().notNullable()
		table.integer("user_role_id").unsigned().notNullable()
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.foreign("organization_id").references("organizations.id").onDelete("cascade")
		table.foreign("user_role_id").references("user_roles.id").onDelete("cascade")
		table.timestamps(true, true)
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("organization_user_roles") 
};
