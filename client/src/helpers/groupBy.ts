import { GROUP_BY_OPTIONS } from "./constants"
import { Ticket, Status, GroupByOptionsKey } from "../types/common"

type GroupByModifier = {
	[key in GroupByOptionsKey]: any
}

const getGroupByModifier: GroupByModifier = {
	"NONE": (tickets: Array<Ticket>) => {
		return {"None": tickets}
	},
	"PRIORITY": (tickets: Array<Ticket>) => {
		return tickets.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
			if (ticket.priorityId in acc){
				acc[ticket.priorityId].push(ticket)
			}
			else {
				acc[ticket.priorityId] = [ticket]
			}
			return acc
		}, {})
	},
	"EPIC": () => {
		return []
	},
	"ASSIGNEE": () => {
		return []
	},
	"TICKET_TYPE": (tickets: Array<Ticket>) => {
		return tickets.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
			if (ticket.ticketTypeId in acc){
				acc[ticket.ticketTypeId].push(ticket)
			}	
			else {
				acc[ticket.ticketTypeId] = [ticket]
			}
			return acc
		}, {})
	}
}

export const boardGroupBy = 
	(
		option: GroupByOptionsKey, 
		tickets: Array<Ticket>, 
		statusesToDisplay: Array<Status>
	): Array<any> => {
		return []
}

