import { createSlice, current } from "@reduxjs/toolkit"
import { createNewRow, setupInitialBoard, setupNewInitialBoard, prioritySort } from "../helpers/functions" 
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import type { Cell, Board, Priority, Status, Ticket } from "../types/common" 
import { 
	defaultPriorities, 
	defaultRows, 
	defaultStatuses, 
	defaultStatusesToDisplay, 
} from "../helpers/constants" 
import { v4 as uuidv4 } from "uuid" 
import { modalTypes } from "../components/Modal"

interface BoardState {
	board: Cell[][]
	newBoard: Board 
	numRows: number
	numCols: number
	statuses: Array<Status>
	statusesToDisplay: Array<String>
	priorityList: Array<Priority>
	showModal: boolean
	currentTicketId: string | null
	currentModalType: keyof typeof modalTypes
	currentModalProps: Record<string, any>
	tickets: Array<Ticket>
}

const initialState: BoardState = {
	board: setupInitialBoard(4, 4),
	newBoard: setupNewInitialBoard(defaultStatuses, defaultRows),
	numCols: 4,
	numRows: defaultRows,
	statusesToDisplay: defaultStatusesToDisplay,
	statuses: defaultStatuses,
	priorityList: defaultPriorities, 
	tickets: [],
	showModal: false,
	currentModalType: "TICKET_FORM",
	currentModalProps: {},
	currentTicketId: null
}

export const boardSlice = createSlice({
	name: "board",
	initialState,
	reducers: {
		toggleShowModal(state, action: PayloadAction<boolean>){
			state.showModal = action.payload
		},
		setModalType(state, action: PayloadAction<keyof typeof modalTypes>){
			state.currentModalType = action.payload	
		},
		setModalProps(state, action: PayloadAction<Record<string, any>>){
			state.currentModalProps = action.payload
		},
		selectCurrentTicketId(state, action: PayloadAction<string | null>){
			state.currentTicketId = action.payload
		},
		addTicketToBoard(state, action: PayloadAction<Ticket>){
			// TODO: rename newBoard to board
			const {
				newBoard, statuses, statusesToDisplay, tickets
			} = state
			const status = statuses.find(status => status.id === action.payload.status.id)
			if (status){
				newBoard[status.id].push(action.payload)	
			}
			tickets.push(action.payload)

		},
		editTicket(state, action: PayloadAction<Ticket>){
			const { newBoard, statuses, statusesToDisplay } = state
			// edit the ticket within the tickets list
			let ticketIndex = state.tickets.findIndex((ticket) => action.payload.id === ticket.id)
			let originalTicket = state.tickets[ticketIndex]
			if (action.payload.status.id !== originalTicket.status.id){
				// find the column that the new status belongs to	
				const newStatus = statuses.find(status => status.id === action.payload.status.id)	
				if (newStatus){
					// add the ticket to the respective status column
					newBoard[newStatus.id].push(action.payload)
					// remove the ticket from the column 
					let oldTicketIndex = newBoard[originalTicket.status.id]?.findIndex((t: Ticket) => t.id === originalTicket.id)
					newBoard[originalTicket.status.id]?.splice(oldTicketIndex, 1)
				}
			}
			else {
				// find the ticket within the board via its index and replace
				const ticketsForStatus = newBoard[action.payload.status.id]
				const ticketToEditIndex = ticketsForStatus.findIndex((ticket) => ticket.id === action.payload.id)
				newBoard[action.payload.status.id][ticketToEditIndex] = action.payload
			}
			state.tickets[ticketIndex] = action.payload

		},
		/*
		Sort by columns,
		1) either by all columns if no status Id is provided, OR 
		by a specific column
		Within each column, specify 1 to sort by highest to lowest priority
		or 0 for lowest to highest priority
		*/
		sortByPriority(state, action: PayloadAction<{statusId?: string, sortOrder: number}>){
			const { newBoard, statuses, statusesToDisplay } = state
			const status = statuses.find(status => status.id === action.payload.statusId)
			if (status){
				action.payload.sortOrder === 1 ? prioritySort(newBoard[status.id]) : prioritySort(newBoard[status.id]).reverse()
			}
			else {
				Object.keys(newBoard).forEach((statusId) => {
					action.payload.sortOrder === 1 ? prioritySort(newBoard[statusId]) : prioritySort(newBoard[statusId]).reverse()
				})	
			}
		},
		deleteAllTickets(state){
			const {newBoard, statuses, numRows, numCols} = state
			for (let i = 0; i < statuses.length; ++i){
				if (statuses[i].id in newBoard){
					newBoard[statuses[i].id] = []
				}
			}
			// delete all tickets in the ticket list
			state.tickets = []
		},
		updateStatuses(state, action: PayloadAction<Array<Status>>){
			state.statuses = action.payload
			const currentStatuses = Object.keys(state.newBoard)
			// create a new status column for the board if not present
			const newStatuses = action.payload.filter((status) => !currentStatuses.includes(status.id))
			newStatuses.forEach((status) => {
				state.newBoard[status.id] = []
			})
		},
		updateStatusesToDisplay(state, action: PayloadAction<Array<String>>){
			state.statusesToDisplay = action.payload
		}
	}
})

export const { 
	addTicketToBoard, 
	deleteAllTickets, 
	editTicket, 
	selectCurrentTicketId, 
	setModalType, 
	setModalProps,
	sortByPriority, 
	updateStatuses,
	updateStatusesToDisplay,
	toggleShowModal 
} = boardSlice.actions
export const boardReducer = boardSlice.reducer 