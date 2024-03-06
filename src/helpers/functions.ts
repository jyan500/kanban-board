import type { Board, Cell, Status, Ticket } from "../types/common"
import { v4 as uuidv4 } from "uuid"

export const setupInitialBoard = (numRows: number, numCols: number) => {	
	let board: Cell[][] = []	
	for (let i = 0; i < numRows; ++i){
		let row = []
		for (let j = 0; j < numCols; ++j){
			const cell: Cell = {
				id: uuidv4(), 
				rowNum: i, 
				colNum: j, 
				ticket: null
			}
			row.push(cell)
		}
		board.push(row)
	}
	return board
}

/* 
New Design:
Map each status id to an array, which represents all tickets for this column
*/
export const setupNewInitialBoard = (statuses: Array<Status>, numRows: number) => {
	let board: Board = {}
	for (let i = 0; i < statuses.length; ++i){
		board[statuses[i].id] = []
	}
	return board
}

export const createNewRow = (rowNum: number, numCols: number) => {
	let row: Cell[] = []
	for (let i = 0; i < numCols; ++i){
		const cell: Cell = {
			id: uuidv4(),
			rowNum: rowNum,
			colNum: i, 
			ticket: null
		}	
		row.push(cell)
	}
	return row
}

export const prioritySort = (tickets: Array<Ticket>) => {
	const sortKey = (a: Ticket, b: Ticket) => {
		if (a && b){
			if (a.priority.order < b.priority.order){
				return -1
			}
			else if (a.priority.order > b.priority.order){
				return 1
			}
			else {
				if (a.ticketName < b.ticketName){
					return 1
				}
				else if (a.ticketName > b.ticketName){
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



