/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('entity_history', function(table) {
        table.increments('history_id').primary()
        
        // Entity identification
        table.string('entity_type', 50).notNullable() // i.e tickets, and related entities such as ticket_relationships, ticket_comments 
        table.integer('entity_id').notNullable() // The ID of the changed record
        
        // Parent relationship (for related entities)
        table.string('parent_entity_type', 50) // 'ticket' for child entities
        table.integer('parent_entity_id') // ticket_id for comments, relationships, sprints
        
        // Change data
        table.jsonb('record_data').notNullable() // Full record snapshot
        table.string('operation', 20).notNullable() // INSERT, UPDATE, DELETE, LINK, UNLINK
        table.jsonb('change_details') // What changed (for UPDATEs)
        
        // Metadata
        table.integer('changed_by') // User ID who made the change
        table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now())
        table.string('ip_address', 45)
        table.text('user_agent')
        
        // Indexes for efficient querying
        table.index(['entity_type', 'entity_id'], 'idx_entity_type_id')
        table.index(['parent_entity_type', 'parent_entity_id'], 'idx_parent_entity')
        table.index(['parent_entity_type', 'parent_entity_id', 'changed_at'], 'idx_parent_timeline')
        table.index('changed_at', 'idx_changed_at')
        table.index('changed_by', 'idx_changed_by')
        table.index(['entity_type', 'changed_at'], 'idx_entity_type_timeline')
        
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('entity_history')
};
