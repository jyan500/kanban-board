const BULK_INSERT_LIMIT = 500
const DEFAULT_STATUSES = [
	{name: "Selected For Dev", order: 1, is_active: true, is_completed: false},
	{name: "In Progress", order: 2, is_active: true, is_completed: false},
	{name: "Code Complete", order: 3, is_active: true, is_completed: false},
	{name: "On Test", order: 4, is_active: true, is_completed: false},
	{name: "Staging", order: 5, is_active: true, is_completed: false},
	{name: "Complete", order: 6, is_active: true, is_completed: true},
]

const DEFAULT_PER_PAGE = 10
const MIN_COLUMN_LIMIT = 1
const MAX_COLUMN_LIMIT = 50

const MIN_BOARD_TICKET_LIMIT = 1
const MAX_BOARD_TICKET_LIMIT = 1000

const ORG_STATUS_LIMIT = 10

const EXCEEDED_MESSAGE = "You have exceeded the maximum amount of attempts. Please try again later."

const TICKET_ENTITY_TYPES = {
   "tickets_to_users": (ticketName, displayName, action) => {
		const actionTypes = {"INSERT": "assigned to", "DELETE": "removed from"}
		if (action in actionTypes){
			return `${displayName} has been ${actionTypes[action]} ${ticketName}`
		}
		return ""
	}, 
	"tickets_to_boards": (ticketName, boardName, action) => {
		const actionTypes = {"INSERT": "added to", "DELETE": "removed from"}
		if (action in actionTypes){
			return `${ticketName} has been ${actionTypes[action]} ${boardName}`
		}
		return ""
	}, 
	"ticket_activity": (ticketName, displayName, action) => {
		const actionTypes = {"INSERT": "logged"}
		if (action in actionTypes){
			return `${displayName} has ${actionTypes[action]} time to ${ticketName}`
		}
		return ""
	}, 
	"ticket_comments": (ticketName, displayName, action) => {
		const actionTypes = {"INSERT": "commented on"}
		if (action in actionTypes){
			return `${displayName} commented on ${ticketName}`
		}
		return ""
	}, 
	"ticket_relationships": (parentTicketName, childTicketName, action) => {
		const actionTypes = {"LINK": "linked to", "DELETE": "unlinked from"}
		if (action in actionTypes){
			return `${childTicketName} has been ${actionTypes[action]} ${parentTicketName}`
		}
		return ""
	}
}

module.exports = {
	BULK_INSERT_LIMIT,
	DEFAULT_STATUSES,
	MIN_COLUMN_LIMIT,
	MAX_COLUMN_LIMIT,
	MIN_BOARD_TICKET_LIMIT,
	MAX_BOARD_TICKET_LIMIT,
	ORG_STATUS_LIMIT,
	EXCEEDED_MESSAGE,
	TICKET_ENTITY_TYPES,
}
