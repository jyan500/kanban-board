import type { KanbanBoard, Cell, Status, Toast, Ticket, Priority, UserProfile } from "../types/common"
import { v4 as uuidv4 } from "uuid"
import { AppDispatch } from "../store"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
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

/*
returns board that has each column of tickets sorted by priority
*/
export const prioritySort = (
	board: KanbanBoard, 
	tickets: Array<Ticket>, 
	priorities: Array<Priority>, 
	sortOrder: 1 | -1, 
	statusId: number | undefined) => {
	let tempBoard = {...board}
	if (statusId){
		const ticketIdArray = board[statusId]
		const ticketAndPriorities = ticketIdArray.map((ticketId) => {
			const ticket = tickets.find((ticket: Ticket)=>ticket.id === ticketId)
			if (ticket){
				const priority = priorities.find((priority: Priority) => priority.id === ticket.priorityId)
				if (priority){
					return {priorityOrder: priority.order, id: ticketId, name: ticket.name}	
				}
			}
			return {priorityOrder: 0, id: 0, name: ""}	
		})
		const sortedTicketAndPriorities = prioritySortHelper(ticketAndPriorities.filter((obj) => obj.id !== 0))
		const sortedTicketIds = sortedTicketAndPriorities.map((obj) => obj.id)
		tempBoard = {...tempBoard, [statusId]: sortOrder === 1 ? sortedTicketIds : sortedTicketIds.reverse()}
	}
	else {
		for (let key of Object.keys(board)){
			const ticketIdArray = board[key]
			const ticketAndPriorities = ticketIdArray.map((ticketId) => {
				const ticket = tickets.find((ticket: Ticket)=>ticket.id === ticketId)
				if (ticket){
					const priority = priorities.find((priority: Priority) => priority.id === ticket.priorityId)
					if (priority){
						return {priorityOrder: priority.order, id: ticketId, name: ticket.name}	
					}
				}
				return {priorityOrder: 0, id: 0, name: ""}	
			})
			const sortedTicketAndPriorities = prioritySortHelper(ticketAndPriorities.filter((obj) => obj.id !== 0))
			const sortedTicketIds = sortedTicketAndPriorities.map((obj) => obj.id)
			tempBoard = {...tempBoard, [key]: sortOrder === 1 ? sortedTicketIds : sortedTicketIds.reverse()}
		}
	}
	return tempBoard
}

export const prioritySortHelper = (tickets: Array<{priorityOrder: number, id: number, name: string}>) => {
	const sortKey = (a: {priorityOrder: number, id: number, name: string}, b: {priorityOrder: number, id: number, name: string}) => {
		if (a && b){
			if (a.priorityOrder < b.priorityOrder){
				return -1
			}
			else if (a.priorityOrder > b.priorityOrder){
				return 1
			}
			else {
				if (a.name < b.name){
					return 1
				}
				else if (a.name > b.name){
					return -1
				}
			}
		}	
		return 0
	}	
	return tickets.sort(sortKey)
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

/**
 * @param parse url parameters
 * @return url string with params included
 */
export const parseURLParams = (params: Record<string, any>) => {
	const keys = Object.keys(params)
	return keys.reduce((acc, key, i) => {
		if (i < keys.length - 1){
			return acc + `${key}=${params[key]}&`
		}
		return acc + `${key}=${params[key]}`
	}, "")
}

/**
 * @param user
 * @return string containing the users' first and last name if the user exists, otherwise returns an empty string
 */
export const displayUser = (user: UserProfile | null | undefined) => {
	return user ? (user.firstName + " " + user.lastName) : ""
}




