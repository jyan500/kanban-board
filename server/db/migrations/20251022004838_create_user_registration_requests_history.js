/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('user_registration_requests_history', function(table) {
        table.increments('history_id').primary()
        table.integer('user_registration_request_id').notNullable()
        table.jsonb('record_data').notNullable() // Stores all column data flexibly
        table.string('operation', 20).notNullable() // INSERT, UPDATE, DELETE
        table.integer('changed_by') // User ID who made the change
        table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now())
        table.jsonb('change_details') // Stores what specifically changed
        table.string('ip_address', 45) // IPv4 or IPv6
        table.text('user_agent') // Browser/client info
        
        // Indexes for efficient querying
        table.index('user_registration_request_id', 'idx_urr_req_id')
        table.index(['user_registration_request_id', 'changed_at'], 'idx_urr_req_id_chg_at')
        table.index('changed_at')
        
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('user_registration_requests_history')
};
