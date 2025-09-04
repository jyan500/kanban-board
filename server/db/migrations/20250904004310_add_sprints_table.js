/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("sprints", (table) => {
        table.increments("id").primary()	
        table.string("name")
		table.text("goal").nullable()
		table.text("debrief").nullable()
        table.integer("status_id").unsigned()
        table.foreign("status_id").references("statuses.id").onDelete("cascade")
        table.integer("organization_id").unsigned()
        table.foreign("organization_id").references("organizations.id").onDelete("cascade")
		table.integer("user_id").unsigned()
		table.foreign("user_id").references("users.id").onDelete("cascade")
		table.timestamp("start_date").nullable()
		table.timestamp("end_date").nullable()
		table.timestamp('created_at').defaultTo(knex.fn.now());	
 		table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists("sprints") 
};
