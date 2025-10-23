const { insertAndGetId, bulkInsertAndGetIds } = require("../helpers/functions")

class HistoryService {
    constructor(knex) {
        this.knex = knex
    }

    /**
     * Get the history table name for a given table
     */
    getHistoryTableName(tableName) {
        return `${tableName}_history`
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

    /**
     * Record a history entry
     */
    async recordHistory(trx, tableName, recordId, data, operation, context = {}) {
        const historyTable = this.getHistoryTableName(tableName)
        const primaryKeyName = this.getPrimaryKeyName(tableName)
        
        const historyEntry = {
            [primaryKeyName]: recordId,
            record_data: data, // Store all data in JSONB column
            operation,
            changed_by: context.userId,
            changed_at: new Date(),
            change_details: context.oldRecord ? this.getChanges(context.oldRecord, data) : null,
            ip_address: context.ipAddress,
            user_agent: context.userAgent
        }

        await trx(historyTable).insert(historyEntry)
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

                await this.recordHistory(
                    transaction,
                    tableName,
                    id,
                    recordData,
                    'INSERT',
                    context
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
            const primaryKeyName = this.getPrimaryKeyName(tableName)

            // Fetch old records before update for history tracking
            const oldRecords = await transaction(tableName)
                .whereIn(primaryKeyName, ids)
                .select('*')

            if (oldRecords.length === 0) {
                throw new Error(`No records found for update with provided IDs in ${tableName}`)
            }

            // Perform the bulk update
            const updatedRowsCount = await transaction(tableName)
                .whereIn(primaryKeyName, ids)
                .update(data)

            // Record history for each updated record
            for (const oldRecord of oldRecords) {
                await this.recordHistory(
                    transaction,
                    tableName,
                    oldRecord[primaryKeyName],
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
                throw new Error(`Record with id ${id} not found in ${tableName}`)
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
     * Get history for a specific record
     */
    async getHistory(tableName, recordId, options = {}) {
        const {
            limit = 100,
            offset = 0,
            startDate = null,
            endDate = null,
            operations = null
        } = options

        const historyTable = this.getHistoryTableName(tableName)
        const primaryKeyName = this.getPrimaryKeyName(tableName)

        let query = this.knex(historyTable)
            .select(
                'history_id',
                primaryKeyName,
                'record_data',
                'operation',
                'changed_by',
                'changed_at',
                'change_details',
                'ip_address',
                'user_agent'
            )
            .where(primaryKeyName, recordId)
            .orderBy('changed_at', 'desc')
            .limit(limit)
            .offset(offset)

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
     * Get all changes made by a specific user
     */
    async getChangesByUser(tableName, userId, options = {}) {
        const { limit = 100, offset = 0 } = options
        const historyTable = this.getHistoryTableName(tableName)

        return this.knex(historyTable)
            .where('changed_by', userId)
            .orderBy('changed_at', 'desc')
            .limit(limit)
            .offset(offset)
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
}

module.exports = HistoryService
