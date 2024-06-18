/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return Promise.all(["users", "user_roles", "organizations", "organization_user_roles", "boards", "statuses", "priorities",
		"ticket_types", "tickets", "tickets_to_users", "tickets_to_boards", "boards_to_statuses"].map((tableName) => {
			return knex.schema.alterTable(tableName, function(table) {
		        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).alter();
		    });	
		})
	)
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return Promise.all(["users", "user_roles", "organizations", "organization_user_roles", "boards", "statuses", "priorities",
		"ticket_types", "tickets", "tickets_to_users", "tickets_to_boards", "boards_to_statuses"].map((tableName) => {
			return knex.schema.alterTable(tableName, function(table) {
		        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP')).alter();
		    });	
		})
	)
};