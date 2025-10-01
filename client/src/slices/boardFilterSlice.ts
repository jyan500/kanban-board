import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { OptionType } from "../types/common" 
import { modalTypes } from "../components/Modal"
import { logout } from "./authSlice"
import { format, startOfWeek, endOfWeek } from "date-fns"

export interface BoardFilters {
	ticketTypeId: number | null
	statusId: number | null
	assignee: number | null 
	priorityId: number | null
	startDate: string | null
	endDate: string | null
	sprintId: string | null
}

interface BoardFilterState {
	filters: BoardFilters
	filterButtonState: number
}

const initialState: BoardFilterState = {
	filters: {
		ticketTypeId: null,
		statusId: null,
		assignee: null,
		priorityId: null,
		startDate: null,
		endDate: null,
		sprintId: null,
	},
	filterButtonState: 0
}

export const boardFilterSlice = createSlice({
	name: "boardFilter",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<BoardFilters>){
			state.filters = action.payload	
		},
		setFilterButtonState(state, action: PayloadAction<number>){
			state.filterButtonState = action.payload
		}
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
} = boardFilterSlice.actions
export const boardFilterReducer = boardFilterSlice.reducer 
