import type { KanbanBoard, Cell, Status, Toast, Ticket } from "../types/common"
import { v4 as uuidv4 } from "uuid"
import { AppDispatch } from "../store"
/* 
New Design:
Map each status id to an array, which represents all tickets for this column
*/
export const setupInitialBoard = (statuses: Array<Status>, numRows: number) => {
	let board: KanbanBoard = {}
	for (let i = 0; i < statuses.length; ++i){
		board[statuses[i].id] = []
	}
	return board
}

export const prioritySort = (tickets: Array<Ticket>) => {
	// const sortKey = (a: Ticket, b: Ticket) => {
	// 	if (a && b){
	// 		if (a.priority.order < b.priority.order){
	// 			return -1
	// 		}
	// 		else if (a.priority.order > b.priority.order){
	// 			return 1
	// 		}
	// 		else {
	// 			if (a.name < b.name){
	// 				return 1
	// 			}
	// 			else if (a.name > b.name){
	// 				return -1
	// 			}
	// 		}
	// 	}	
	// 	return 0
	// }	
	// return tickets.sort(sortKey)
	return tickets
}

export const sortStatusByOrder = (a: Status, b: Status) => {
	if (a.order < b.order){
		return -1
	}
	else if (a.order > b.order){
		return 1
	}
	return 0
}

export const doTicketsContainStatus = (statusId: number, tickets: Array<number>) => {
	// const ticketsWithStatus = tickets.filter((ticket) => ticket.status.id === statusId)	
	// return ticketsWithStatus.length > 0
	return false
}

/**
 * @param backend error response as an object
 * @return Array of strings containing the parsed error messages
 */
export const parseErrorResponse = (err: Record<string, any>): Array<string> => {
	return Object.values(err).map((e) => e[0])
}




