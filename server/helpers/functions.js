const db = require("../db/db")
const { parse } = require('node-html-parser')
const Mustache = require("mustache")
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
	const ticket = await db("tickets").where("id", obj.ticket_id).first()
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
		case "Mention":
			if (ticket && sender && recipient){
				fields = {
					ticket_name: ticket?.name, 	
					sender_name: `${sender?.first_name} ${sender.last_name}`,
				}
			}
			break
		case "Ticket Update":	
			if (ticket && sender && recipient){
				fields = {
					ticket_name: ticket?.name, 	
					sender_name: `${sender?.first_name} ${sender?.last_name}`,
				}
			}
			break
		case "Ticket Assigned":	
			if (ticket && sender && recipient){
				fields = {
					ticket_name: ticket?.name, 	
					sender_name: `${sender?.first_name} ${sender?.last_name}`,
				}
			}
			break
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

module.exports = {
	getNotificationBody,
	mapIdToRowObject,
	mapIdToRowAggregateArray,
	mapIdToRowAggregateObjArray,
	parseMentions,
	getFromNestedObject
}
