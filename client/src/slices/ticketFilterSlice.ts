import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { OptionType } from "../types/common" 
import { modalTypes } from "../components/Modal"
import { logout } from "./authSlice"
import { format, startOfWeek, endOfWeek } from "date-fns"

export interface TicketFilters {
	ticketTypeId: number | null
	statusId: number | null
	priorityId: number | null
	boardId: number | null
	sprintId: number | null
	assignedToUser: number | string | null
}

interface TicketFilterState {
	filters: TicketFilters
}

const initialState: TicketFilterState = {
	filters: {
		ticketTypeId: null,
		statusId: null,
		priorityId: null,
		boardId: null,
		sprintId: null,
		assignedToUser: null
	},
}

export const ticketFilterSlice = createSlice({
	name: "ticketFilter",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<TicketFilters>){
			state.filters = action.payload	
		},
	},
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { 
	setFilters,
} = ticketFilterSlice.actions
export const ticketFilterReducer = ticketFilterSlice.reducer 
