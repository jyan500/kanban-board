/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("organizations", function(table){
		table.string("phone_number").nullable()
		table.string("email").nullable()
		table.string("address").nullable()
		table.string("city").nullable()
		table.string("state").nullable()
		table.string("zipcode").nullable()
		table.string("industry").nullable()
	}) 	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("organizations", function(table){
		table.dropColumn("phone_number")
		table.dropColumn("email")
		table.dropColumn("address")
		table.dropColumn("city")
		table.dropColumn("state")
		table.dropColumn("zipcode")
		table.dropColumn("industry")
	})  
};
