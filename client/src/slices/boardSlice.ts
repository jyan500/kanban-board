import { createSlice, current } from "@reduxjs/toolkit"
import { setupInitialBoard, prioritySort } from "../helpers/functions" 
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import type { Cell, Board, KanbanBoard, Priority, Status, Ticket } from "../types/common" 
import { 
	defaultPriorities, 
	defaultRows, 
	defaultStatuses, 
	defaultStatusesToDisplay, 
} from "../helpers/constants" 
import { v4 as uuidv4 } from "uuid" 
import { modalTypes } from "../components/Modal"
import { logout } from "./authSlice"

interface BoardState {
	boardInfo: Board | null 
	board: KanbanBoard 
	statusesToDisplay: Array<Status>
	currentTicketId: number | null
	// tickets: Array<number>
	tickets: Array<Ticket>
}

const initialState: BoardState = {
	boardInfo: null,
	board: {},
	statusesToDisplay: [],
	tickets: [],
	currentTicketId: null
}

export const boardSlice = createSlice({
	name: "board",
	initialState,
	reducers: {
		setBoardInfo(state, action:PayloadAction<Board>){
			state.boardInfo = action.payload
		},
		setBoard(state, action: PayloadAction<KanbanBoard>){
			state.board = action.payload
		},
		setStatusesToDisplay(state, action: PayloadAction<Array<Status>>){
			state.statusesToDisplay = action.payload
		},
		selectCurrentTicketId(state, action: PayloadAction<number | null>){
			state.currentTicketId = action.payload
		},
		setTickets(state, action: PayloadAction<Array<Ticket>>){
			state.tickets = action.payload
		},
	},
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { 
	selectCurrentTicketId, 
	setBoard,
	setBoardInfo,
	setStatusesToDisplay,
	setTickets,
} = boardSlice.actions
export const boardReducer = boardSlice.reducer 