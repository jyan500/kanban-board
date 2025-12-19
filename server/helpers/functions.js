const db = require("../db/db")
const { parse } = require('node-html-parser')
const config = require("../config")
const Mustache = require("mustache")
const { TICKET_ENTITY_TYPES } = require("../constants")
/*
turns an object of the following from knex into an object where the key is the id of the row, mapped
to the rest of the row as an object, or a specific column

specifically for use in group by queries that return different results for the same id

[
	{
		id: 1,
		user_id: 1
	},
	{
		
		id: 1,
		user_id: 2
	}
]

to 

{
	1: [1, 2],	
}

OR if a specific row is mentioned (i.e "name")

to 

{
	1: "Test"
}

*/
const mapIdToRowAggregateArray = (dbObjArray, specificColumn) => {
	let obj = {}
	dbObjArray.map((row) => {
		if (!(row.id in obj)){
			obj[row.id] = []
		}
		if (specificColumn in row){
			obj[row.id].push(row[specificColumn])
		}
	})
	return obj
} 

/*  similar to mapIdToRowAggregateArray, but append object instead of a singular column*/
const mapIdToRowAggregateObjArray = (dbObjArray, additionalColumns) => {
	let obj = {}
	dbObjArray.map((row) => {
		if (!(row.id in obj)){
			obj[row.id] = []
		}
		let res = {}
		for (key of additionalColumns){
			res[key] = row[key]
		}
		obj[row.id].push(res)
	})
	return obj
} 

/* maps an id to its row */
const mapIdToRowObject = (dbObjArray) => {
	let obj = {}	
	dbObjArray.map((row) => {
		obj[row.id] = row
	})
	return obj
}

/* Parses the notification type template using mustache.js */
const getNotificationBody = async (notificationType, obj) => {
	let fields = {} 
	let ticket;
	if (obj.ticket_id){
		ticket = await db("tickets").where("id", obj.ticket_id).first()
	}
	let recipient;
	let sender
	if (obj.recipient_id){
		recipient = await db("users").where("id", obj.recipient_id).first()
	}
	if (obj.sender_id){
		sender = await db("users").where("id", obj.sender_id).first()
	}
	switch (notificationType.name){
		case "Watching Ticket":
			if (ticket && recipient){
				fields = {
					ticket_name: ticket?.name,
					recipient_name: `${recipient?.first_name} ${recipient?.last_name}`
				}
			}
			break
		case "Ticket Unassigned":
		case "Ticket Update":
		case "Mention":
		case "Ticket Assigned":	
			if (ticket && sender && recipient){
				fields = {
					ticket_name: ticket?.name, 	
					sender_name: `${sender?.first_name} ${sender?.last_name}`,
				}
			}
			break
		case "Bulk Assigned":
			if (sender && obj.num_tickets){
				fields = {
					sender_name: `${sender?.first_name} ${sender?.last_name}`,
					num_tickets: obj.num_tickets,
				}	
			}
			break
		case "Bulk Watching":
			if (obj.num_tickets){
				fields = {
					num_tickets: obj.num_tickets,
				}
			}
	}
	return Mustache.render(`${notificationType.template}`, fields)
}

/* Parses the mentions user ID from an HTML body and returns a mapped object to be inserted into the DB */
const parseMentions = async (body, bodyParams, organizationId) => {
	const root = parse(body)
	const mentionNodeInfo = root.querySelectorAll(".mention")
	let mappedObjArray = []
	if (mentionNodeInfo){
		// parse out the user id from the mention HTML entity, and map to an object containing user id and ticket id
		mappedObjArray = await Promise.all(mentionNodeInfo.map(async (node) => {
			const userId = node.getAttribute("data-id")
			const isUser = await db("organization_user_roles").where("user_id", userId).where("organization_id", organizationId).first()
			if (isUser){
				return {...bodyParams, user_id: userId}
			}
			return null
		}))
	}
	return mappedObjArray.filter((obj) => obj)
}

/*  Queries for all sprint tickets, and then filters out the tickets with a completed status */
const aggregateCompletedAndOpenSprintTickets = async (sprintId, completedStatusIds) => {
	const sprintTickets = await db("tickets_to_sprints").where("sprint_id", sprintId).join("tickets", "tickets.id", "=", "tickets_to_sprints.ticket_id").select("tickets.*")
	const numCompletedTickets = sprintTickets.filter((ticket) => completedStatusIds.includes(ticket.status_id)).length
	const numOpenTickets = sprintTickets.length - numCompletedTickets
	return {
		numCompletedTickets,
		numOpenTickets,
	}
}

/* 
	Takes in entity history object, and returns the display string for that particular entity type
*/
const getHistoryDisplayString = async (history) => {
	const user = await db("users").where("id", history.entityType === "tickets_to_users" || history.entityType === "ticket_activity" ? history.recordData.user_id : history.changedBy).first()
	const displayName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`
	let displayText = ""
	const ticketActions = {"INSERT": "created", "UPDATE": "updated", "DELETE": "deleted"}
	const data = history.recordData
	if (history.entityType === "tickets"){
		displayText = `${displayName} has ${history.operation in ticketActions ? ticketActions[history.operation] : ""} ${history.ticketName}` 
	}
	else {
		switch (history.entityType){
			case "ticket_comments":
				displayText = TICKET_ENTITY_TYPES["ticket_comments"](history.ticketName, displayName, history.operation)
				break
			case "tickets_to_boards":
				const board = await db("boards").where("id", Number(data.board_id)).first()
				displayText = TICKET_ENTITY_TYPES["tickets_to_boards"](history.ticketName, board?.name ?? "", history.operation)
				break 
			case "tickets_to_users":
				displayText = TICKET_ENTITY_TYPES["tickets_to_users"](history.ticketName, displayName, history.operation)
				break 
			case "ticket_relationships":
				const childTicket = await db("tickets").where("id", Number(data.child_ticket_id)).first()
				const parentTicket = await db("tickets").where("id", Number(data.parent_ticket_id)).first()
				displayText = TICKET_ENTITY_TYPES["ticket_relationships"](parentTicket?.name ?? "", childTicket?.name ?? "", history.operation)
				break
			case "ticket_activity":
				displayText = TICKET_ENTITY_TYPES["ticket_activity"](history.ticketName, displayName, history.operation)
			    break
		}
	}
	return displayText
}

/* 
	convert string dot notation into the syntax to retrieve an object 
	i.e 
	input: 
	obj = {
		a : {
			b: "hello"
		}
	}
	path = "a.b"
	the output would be "hello"
*/
const getFromNestedObject = (obj, path) => path.split(".").reduce((acc, pathPart) => acc?.[pathPart], obj)

// abstract transactional batch update
const batchUpdate = (table, collection) => {
  return db.transaction(trx => {
    const queries = collection.map(tuple =>
      db(table)
        .where('id', tuple.id)
        .update(tuple)
        .transacting(trx)
    );
    return Promise.all(queries)
      .then(trx.commit)    
      .catch(trx.rollback);
  });
}

/* 
	Takes in an async function (i.e async middleware) in order
	to use in a setting where async keyword cannot be used
*/
const asyncHandler = fn => (req, res, next) => {
	fn(req, res, next).catch(next)
}


// code from: https://github.com/cockroachlabs/example-app-node-knex/blob/main/app.js
// Wrapper for a transaction.  This automatically re-calls the operation with
// the client as an argument as long as the database server asks for
// the transaction to be retried.
const retryTxn = async (n, max, operation) => {
  const transactionProvider = db.transactionProvider();
  const transaction = await transactionProvider();
  while (true) {
    n++;
    if (n === max) {
      throw new Error("Max retry count reached.");
    }
    try {
      const res = await operation
      const test = await transaction.commit();
      return res;
    } catch (err) {
      if (err.code !== "40001") {
        console.error(err.message);
        throw err;
      } else {
        console.log("Transaction failed. Retrying transaction.");
        console.log(err.message);
        await transaction.rollback();
        await new Promise((r) => setTimeout(r, 2 ** n * 1000));
      }
    }
  }
}

// Wrapper around the previous function, with a max retries set to 15
const retryTransaction = async (operation) => {
	return await retryTxn(0, config.maxTransactionRetries, operation)
}

/**
 * Inserts a single record and return id
 */
const insertAndGetId = async (tableName, data) => {
	const result = await retryTransaction(db(tableName).insert(data, 'id'));
	return result[0]?.id ?? result[0];
}

/**
 * Inserts multiple records and returns all ids
 */
const bulkInsertAndGetIds = async (tableName, data) => {
	await retryTransaction(db(tableName).insert(data));
	// order the results by id desc and get the last X amount of results based on the length of data
	const results = await retryTransaction(db(tableName).orderBy("id", "desc").limit(data.length))
	// re-order the ids in their inserted order
	return results.map((result) => result.id).toSorted()
}

module.exports = {
	batchUpdate,
	insertAndGetId,
	getNotificationBody,
	mapIdToRowObject,
	mapIdToRowAggregateArray,
	mapIdToRowAggregateObjArray,
	parseMentions,
	getFromNestedObject,
	asyncHandler,
	insertAndGetId,
	bulkInsertAndGetIds,
	retryTransaction,
	aggregateCompletedAndOpenSprintTickets,
	getHistoryDisplayString,
}
