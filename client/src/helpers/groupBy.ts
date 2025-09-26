import { GROUP_BY_OPTIONS } from "./constants"
import { Ticket, Status, GroupByOptionsKey, GroupedTickets, UserProfile } from "../types/common"

type GroupByModifier = {
	[key in GroupByOptionsKey]: (tickets: Array<Ticket>) => Record<string, Array<Ticket>>
}

/* 
	maps each ticket to its group option
*/
const groupByModifierMap: GroupByModifier = {
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
	"EPIC": (tickets: Array<Ticket>) => {
		return tickets.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
			ticket.epicParentTickets?.forEach((epic: {id: number, name: string}) => {
				if (epic.id in acc){
					acc[epic.id].push(ticket)
				}
				else {
					acc[epic.id] = [ticket]
				}
			})	
			return acc
		}, {})
	},
	"ASSIGNEE": (tickets: Array<Ticket>) => {
		return tickets.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
			ticket.assignees?.forEach((user: Pick<UserProfile, "id" | "firstName" | "lastName">) => {
				if (user.id in acc){
					acc[user.id].push(ticket)
				}	
				else {
					acc[user.id] = [ticket]
				}
			})
			return acc
		}, {})
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

/* 
	Based on the group by option, parses the array of tickets into the grouped version
	Example:
	if "TICKET_TYPE" is chosen
	1) creates an object like so based on the group by modifier
	{
		ticketTypeId 1: [Array of tickets with ticketTypeId 1],
		ticketTypeId 2: [Array of tickets with ticketTypeId 2],
		...
	}	
*/
export const applyGroupModifier = (
	option: GroupByOptionsKey,
	tickets: Array<Ticket>
) => {
	const modifier = groupByModifierMap[option as GroupByOptionsKey]
	const grouped: Record<string, Array<Ticket>> = modifier(tickets)
	return grouped
}

/* 
	Based on the group by option, parses the array of tickets into the grouped version that's separated by status
	Example:
	if "TICKET_TYPE" is chosen
	1) creates an object like so based on the group by modifier
	{
		ticketTypeId 1: [Array of tickets with ticketTypeId 1],
		ticketTypeId 2: [Array of tickets with ticketTypeId 2],
		...
	}
	2) Within each array of tickets, it will further group this by status id like so.
	{	
		ticketTypeId 1 : {
			status id1: [Array of tickets with status id 1]
			status id2: [Array of tickets with status id 2],
			...
		},
		ticketTypeID 2: {
			status id1: [Array of tickets with status id 1]
			status id2: [Array of tickets with status id 2],
			...
		},
		...
	}	
*/
export const boardGroupBy = 
	(
		option: GroupByOptionsKey, 
		tickets: Array<Ticket>, 
		statusesToDisplay: Array<Status>
	): GroupedTickets => {
		const grouped: Record<string, Array<Ticket>> = applyGroupModifier(option, tickets)
		return Object.keys(grouped).reduce((acc: Record<string, Record<string, Array<number>>>, key: string) => {
			const groupedTickets = grouped[key]
			const groupedTicketIdsByStatusMap = statusesToDisplay.reduce((acc: Record<string, Array<number>>, status: Status) => {
				acc[(status.id.toString()) as string] = groupedTickets.filter((ticket) => ticket.statusId === status.id).map((ticket) => ticket.id)
				return acc
			}, {})
			if (!(key in acc)){
				acc[(key.toString()) as string] = groupedTicketIdsByStatusMap
			}
			return acc
		}, {})
}


