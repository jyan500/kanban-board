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
	sprintId: number | null
}

interface BoardFilterState {
	filters: BoardFilters
	bulkEditFilters: BoardFilters
	filterButtonState: boolean
	filterIdMap: BoardFilters
	bulkEditFilterButtonState: boolean
}

const initialState: BoardFilterState = {
	filters: {
		ticketTypeId: null,
		statusId: null,
		assignee: null,
		priorityId: null,
		sprintId: null,
	},
	bulkEditFilters: {
		ticketTypeId: null,
		statusId: null,
		assignee: null,
		priorityId: null,
		sprintId: null,	
	},
	/* note that this should only be set once on page load, this maps the 
	   name of the filter to its corresponding id in the boards_to_filters table */
	filterIdMap: {
		ticketTypeId: null,
		statusId: null,
		assignee: null,
		priorityId: null,
		sprintId: null,
	},
	filterButtonState: false,
	bulkEditFilterButtonState: false
}

export const boardFilterSlice = createSlice({
	name: "boardFilter",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<BoardFilters>){
			state.filters = action.payload	
		},
		setBulkEditFilters(state, action: PayloadAction<BoardFilters>){
			state.bulkEditFilters = action.payload
		},
		setFilterButtonState(state, action: PayloadAction<boolean>){
			state.filterButtonState = action.payload
		},
		setFilterIdMap(state, action: PayloadAction<BoardFilters>){
			state.filterIdMap = action.payload
		},
		setBulkEditFilterButtonState(state, action: PayloadAction<boolean>){
			state.bulkEditFilterButtonState = action.payload
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
	setBulkEditFilters,
	setBulkEditFilterButtonState,
	setFilterIdMap,
} = boardFilterSlice.actions
export const boardFilterReducer = boardFilterSlice.reducer 
