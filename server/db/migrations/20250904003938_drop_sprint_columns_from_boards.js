/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("boards", function(table){
        table.dropColumn("is_sprint_complete")
        table.dropColumn("is_sprint")
        table.dropColumn("sprint_debrief")
		table.dropColumn("start_date")
		table.dropColumn("description")
		table.dropColumn("end_date")
	}) 
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("boards", function(table){
		table.boolean("is_sprint_complete").defaultTo(false)
		table.boolean("is_sprint").defaultTo(false)
		table.text("sprint_debrief").nullable()
		table.timestamp("start_date").nullable()
		table.timestamp("end_date").nullable()
		table.text("description")
	}) 
};
