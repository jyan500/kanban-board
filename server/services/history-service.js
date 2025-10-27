const { insertAndGetId, bulkInsertAndGetIds } = require("../helpers/functions")

class HistoryService {
    constructor(knex) {
        this.knex = knex
        
        // Define which entities use dedicated history tables
        this.dedicatedHistoryEntities = ['users']
        
        // Default unified history table
        this.unifiedHistoryTable = 'entity_history'
    }

    /**
     * Get the appropriate history table for an entity
     */
    getHistoryTable(entityType) {
        if (this.dedicatedHistoryEntities.includes(entityType)) {
            return `${entityType}_history`
        }
        return this.unifiedHistoryTable
    }

    /**
     * Check if entity uses dedicated history table
     */
    usesDedicatedHistory(entityType) {
        return this.dedicatedHistoryEntities.includes(entityType)
    }

    /**
     * Get the primary key column name (assumes pattern: users -> user_id)
     */
    getPrimaryKeyName(tableName) {
        const singular = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName
        return `${singular}_id`
    }

    /**
     * Calculate what changed between old and new records
     */
    getChanges(oldRecord, newRecord) {
        const changes = {}
        
        if (!oldRecord) return null
        
        for (const [key, newValue] of Object.entries(newRecord)) {
            if (oldRecord[key] !== newValue && key !== 'updated_at') {
                changes[key] = {
                    from: oldRecord[key],
                    to: newValue
                }
            }
        }
        
        return Object.keys(changes).length > 0 ? changes : null
    }

    async recordHistory(trx, entityType, entityId, data, operation, context = {}) {
        const historyTable = this.getHistoryTable(entityType)
        const primaryKeyName = this.getPrimaryKeyName(entityType)
        
        if (this.usesDedicatedHistory(entityType)) {
            // Insert into dedicated history table (e.g., users_history)
            const historyEntry = {
                [primaryKeyName]: entityId,
                record_data: data,
                operation,
                changed_by: context.userId,
                changed_at: new Date(),
                change_details: context.oldRecord ? this.getChanges(context.oldRecord, data) : null,
                ip_address: context.ipAddress,
                user_agent: context.userAgent
            }

            await trx(historyTable).insert(historyEntry)
        } else {
            // Insert into unified history table (entity_history)
            const historyEntry = {
                entity_type: entityType,
                entity_id: entityId,
                parent_entity_type: context.parentEntityType || null,
                parent_entity_id: context.parentEntityId || null,
                record_data: data,
                operation,
                changed_by: context.userId,
                changed_at: new Date(),
                change_details: context.oldRecord ? this.getChanges(context.oldRecord, data) : null,
                ip_address: context.ipAddress,
                user_agent: context.userAgent
            }

            await trx(historyTable).insert(historyEntry)
        }
    }

    /**
     * Insert with history tracking
     */
    async insert(tableName, data, context, trx = null) {
        const query = async (transaction) => {
            // const [id] = await transaction(tableName).insert(data).returning('id')
            const id = await insertAndGetId(tableName, data)
            
            await this.recordHistory(
                transaction,
                tableName,
                id,
                data,
                'INSERT',
                context
            )
            
            return id
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Bulk insert with history tracking
     */
    async bulkInsert(tableName, data, context, trx = null) {
        const query = async (transaction) => {
            // Insert all records and get their IDs
            const insertedIds = await bulkInsertAndGetIds(tableName, data)

            // Record history for each inserted record
            for (let i = 0; i < insertedIds.length; i++) {
                const id = insertedIds[i]
                const recordData = data[i] // Assuming the order of data and insertedIds is consistent
                let bulkParentContext = null
                if (context.bulkParentEntityInfo && context.useParentEntityId){
                    // using the parent entity id of the record, find the appropriate bulk parent context that was passed in
                    // for example, if searching within "tickets_to_users", "ticket_id" would be the parent,
                    // so we would be looking for the record within bulkParentEntityInfo that has that ticket id
                    bulkParentContext = context.bulkParentEntityInfo.find((obj) => obj.parentEntityId === Number(recordData[context.useParentEntityId]))
                }

                await this.recordHistory(
                    transaction,
                    tableName,
                    id,
                    recordData,
                    // if this is a many to many, categorize as "link", otherwise treat as "insert"
                    context.parentEntityType ? 'LINK' : 'INSERT',
                    {
                        ...context, 
                        ...(bulkParentContext ? bulkParentContext : {})
                    }
                )
            }

            return insertedIds
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Update with history tracking
     */
    async update(tableName, id, data, context, trx = null) {
        const query = async (transaction) => {
            const oldRecord = await transaction(tableName)
                .where({ id })
                .first()

            if (!oldRecord) {
                throw new Error(`Record with id ${id} not found in ${tableName}`)
            }

            const updatedRows = await transaction(tableName)
                .where({ id })
                .update(data)

            await this.recordHistory(
                transaction,
                tableName,
                id,
                data,
                'UPDATE',
                { ...context, oldRecord }
            )

            return updatedRows
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Bulk update with history tracking
     */
    async bulkUpdate(tableName, ids, data, context, trx = null) {
        const query = async (transaction) => {
            // Fetch old records before update for history tracking
            const oldRecords = await transaction(tableName)
                .whereIn("id", ids)
                .select('*')

            if (oldRecords.length === 0) {
                throw new Error(`No records found for update with provided IDs in ${tableName}`)
            }

            // Perform the bulk update
            const updatedRowsCount = await transaction(tableName)
                .whereIn("id", ids)
                .update(data)

            // Record history for each updated record
            for (const oldRecord of oldRecords) {
                await this.recordHistory(
                    transaction,
                    tableName,
                    oldRecord["id"],
                    { ...oldRecord, ...data }, // Merge old data with new data for history
                    'UPDATE',
                    { ...context, oldRecord }
                )
            }

            return updatedRowsCount
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Delete with history tracking
     */
    async delete(tableName, id, context, trx = null) {
        const query = async (transaction) => {
            const oldRecord = await transaction(tableName)
                .where({ id })
                .first()

            if (!oldRecord) {
                console.error(`Record with id ${id} not found in ${tableName}`)
                return
            }

            await transaction(tableName).where({ id }).del()

            await this.recordHistory(
                transaction,
                tableName,
                id,
                oldRecord,
                'DELETE',
                { ...context, oldRecord }
            )
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Bulk Delete with history tracking
     */
    async bulkDelete(tableName, customStatement, context, trx = null) {
        const query = async (transaction) => {
            const oldRecords = await transaction(tableName).modify(customStatement)
            if (oldRecords.length === 0){
                console.error(`Existing records not found in ${tableName}`)
                return
            }

            // Perform the bulk delete
            await transaction(tableName).modify(customStatement).del()

            // Record history for each updated record
            for (const oldRecord of oldRecords) {
                let bulkParentContext = null;
                // using the parent entity id of the record, find the appropriate bulk parent context that was passed in
                // for example, if searching within "tickets_to_users", "ticket_id" would be the parent,
                // so we would be looking for the record within bulkParentEntityInfo that has that ticket id
                if (context.bulkParentEntityInfo && context.useParentEntityId){
                    bulkParentContext = context.bulkParentEntityInfo.find((obj) => obj.parentEntityId === Number(oldRecord[context.useParentEntityId]))
                }
                await this.recordHistory(
                    transaction,
                    tableName,
                    oldRecord["id"],
                    oldRecord,
                    // if this is a many to many, categorize as "unlink", otherwise treat as "delete"
                    context.parentEntityType ? 'UNLINK' : 'DELETE',
                    { 
                        ...context, 
                        ...(bulkParentContext ? bulkParentContext : {}),
                        oldRecord 
                    }
                )
            }
        }
        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Get history for a specific entity (handles both table types)
     */
    async getHistory(entityType, entityId, options = {}) {
        const {
            limit = 100,
            offset = 0,
            startDate = null,
            endDate = null,
            operations = null
        } = options

        const historyTable = this.getHistoryTable(entityType)
        const primaryKeyName = this.getPrimaryKeyName(entityType)

        let query
        
        if (this.usesDedicatedHistory(entityType)) {
            // Query dedicated history table
            query = this.knex(historyTable)
                .where(primaryKeyName, entityId)
                .orderBy('changed_at', 'desc')
                .limit(limit)
                .offset(offset)
        } else {
            // Query unified history table
            query = this.knex(historyTable)
                .where({
                    entity_type: entityType,
                    entity_id: entityId
                })
                .orderBy('changed_at', 'desc')
                .limit(limit)
                .offset(offset)
        }

        if (startDate) {
            query = query.where('changed_at', '>=', startDate)
        }

        if (endDate) {
            query = query.where('changed_at', '<=', endDate)
        }

        if (operations && operations.length > 0) {
            query = query.whereIn('operation', operations)
        }

        return query
    }

    /**
     * Get all changes made by a specific user (searches both tables)
     */
    async getChangesByUser(userId, options = {}) {
        const { 
            limit = 100, 
            offset = 0,
            entityType = null
        } = options

        if (entityType && this.usesDedicatedHistory(entityType)) {
            // Query dedicated history table
            const historyTable = this.getHistoryTable(entityType)
            return this.knex(historyTable)
                .where('changed_by', userId)
                .orderBy('changed_at', 'desc')
                .limit(limit)
                .offset(offset)
        }

        // Query unified history table
        let query = this.knex(this.unifiedHistoryTable)
            .where('changed_by', userId)
            .orderBy('changed_at', 'desc')
            .limit(limit)
            .offset(offset)

        if (entityType) {
            query = query.where('entity_type', entityType)
        }

        return query
    }


    /**
     * Get all changes across both history tables for a user
     */
    async getAllChangesByUser(userId, options = {}) {
        const { limit = 100, offset = 0 } = options

        // Get changes from both tables
        const [userChanges, entityChanges] = await Promise.all([
            this.knex('users_history')
                .where('changed_by', userId)
                .select('*', this.knex.raw("'users' as entity_type")),
            this.knex(this.unifiedHistoryTable)
                .where('changed_by', userId)
                .select('*')
        ])

        // Combine and sort by changed_at
        const allChanges = [...userChanges, ...entityChanges]
            .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))

        return allChanges.slice(offset, offset + limit)
    }

    /**
     * Restore a record to a previous state
     */
    async restoreToVersion(tableName, recordId, historyId, context) {
        return this.knex.transaction(async (trx) => {
            const historyTable = this.getHistoryTableName(tableName)
            
            const historicalVersion = await trx(historyTable)
                .where('history_id', historyId)
                .first()

            if (!historicalVersion) {
                throw new Error(`History record ${historyId} not found`)
            }

            // Extract the data from record_data JSONB column
            const dataToRestore = historicalVersion.record_data

            await this.update(tableName, recordId, dataToRestore, context, trx)
        })
    }

    /**
     * Link ticket to sprint (N:N relationship)
     */
    async linkTicketToSprint(ticketId, sprintId, context, trx = null) {
        const query = async (transaction) => {
            const linkData = {
                ticket_id: ticketId,
                sprint_id: sprintId,
                created_at: new Date()
            }
            
            await transaction('tickets_to_sprints').insert(linkData)

            await this.recordHistory(
                transaction,
                'tickets_to_sprints',
                sprintId,
                linkData,
                'LINK',
                {
                    ...context,
                    parentEntityType: 'ticket',
                    parentEntityId: ticketId
                }
            )
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Unlink ticket from sprint
     */
    async unlinkTicketFromSprint(ticketId, sprintId, context, trx = null) {
        const query = async (transaction) => {
            const oldRecord = await transaction('tickets_to_sprints')
                .where({ ticket_id: ticketId, sprint_id: sprintId })
                .first()

            if (!oldRecord) {
                throw new Error(`Link not found between ticket ${ticketId} and sprint ${sprintId}`)
            }

            await transaction('tickets_to_sprints')
                .where({ ticket_id: ticketId, sprint_id: sprintId })
                .del()

            await this.recordHistory(
                transaction,
                'tickets_to_sprints',
                sprintId,
                oldRecord,
                'UNLINK',
                {
                    ...context,
                    parentEntityType: 'ticket',
                    parentEntityId: ticketId,
                    oldRecord
                }
            )
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     *  
     * Link tickets to user 
     */
    async linkTicketsToUser(data, context, trx=null){
        const query = async (transaction) => {
            this.bulkInsert(
                "tickets_to_users",
                data,
                context,
            )
        }
        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     *  
     * Unlink tickets to user 
     */
    async unlinkTicketsToUser(ticketId, userId, context, trx=null){
        const query = async (transaction) => {

        }
    }

    /**
     * Create ticket relationship (ticket-to-ticket N:N)
     */
    async createTicketRelationship(parentTicketId, childTicketId, relationshipTypeId, context, trx = null) {
        const query = async (transaction) => {
            const relationshipData = {
                parent_ticket_id: parentTicketId,
                child_ticket_id: childTicketId,
                ticket_relationship_type_id: relationshipTypeId,
                created_at: new Date()
            }
            
            const [id] = await transaction('ticket_relationships')
                .insert(relationshipData)
                .returning('id')

            // Record history for BOTH tickets involved
            await this.recordHistory(
                transaction,
                'ticket_relationships',
                id,
                relationshipData,
                'LINK',
                {
                    ...context,
                    parentEntityType: 'ticket',
                    parentEntityId: parentTicketId
                }
            )

            await this.recordHistory(
                transaction,
                'ticket_relationships',
                id,
                relationshipData,
                'LINK',
                {
                    ...context,
                    parentEntityType: 'ticket',
                    parentEntityId: childTicketId
                }
            )

            return id
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }

    /**
     * Delete ticket relationship
     */
    async deleteTicketRelationship(relationshipId, context, trx = null) {
        const query = async (transaction) => {
            const oldRecord = await transaction('ticket_relationships')
                .where({ id: relationshipId })
                .first()

            if (!oldRecord) {
                throw new Error(`Relationship ${relationshipId} not found`)
            }

            await transaction('ticket_relationships')
                .where({ id: relationshipId })
                .del()

            // Record history for BOTH tickets
            await this.recordHistory(
                transaction,
                'ticket_relationships',
                relationshipId,
                oldRecord,
                'UNLINK',
                {
                    ...context,
                    parentEntityType: 'ticket',
                    parentEntityId: oldRecord.parent_ticket_id,
                    oldRecord
                }
            )

            await this.recordHistory(
                transaction,
                'ticket_relationships',
                relationshipId,
                oldRecord,
                'UNLINK',
                {
                    ...context,
                    parentEntityType: 'ticket',
                    parentEntityId: oldRecord.child_ticket_id,
                    oldRecord
                }
            )
        }

        return trx ? query(trx) : this.knex.transaction(query)
    }
}

module.exports = HistoryService
