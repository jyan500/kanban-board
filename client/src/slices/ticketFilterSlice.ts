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
}

interface TicketFilterState {
	filters: TicketFilters
	filterButtonState: boolean
}

const initialState: TicketFilterState = {
	filters: {
		ticketTypeId: null,
		statusId: null,
		priorityId: null,
		boardId: null,
		sprintId: null
	},
	filterButtonState: false,
}

export const ticketFilterSlice = createSlice({
	name: "ticketFilter",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<TicketFilters>){
			state.filters = action.payload	
		},
		setFilterButtonState(state, action: PayloadAction<boolean>){
			state.filterButtonState = action.payload
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
	setFilterButtonState,
} = ticketFilterSlice.actions
export const ticketFilterReducer = ticketFilterSlice.reducer 
