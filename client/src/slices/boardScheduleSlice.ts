import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { OptionType } from "../types/common" 
import { SchedulerData, SchedulerProjectData } from "@bitnoi.se/react-scheduler";
import { modalTypes } from "../components/Modal"
import { logout } from "./authSlice"

export interface BoardScheduleFilters {
	ticketTypeId: number | null
	statusId: number | null
	assignee: number | null 
	priorityId: number | null
	startDate: Date | null
	endDate: Date | null
}

interface BoardScheduleState {
	data: SchedulerData
	filters: BoardScheduleFilters
	filterButtonState: number
}

const initialState: BoardScheduleState = {
	data: [],
	filters: {
		ticketTypeId: null,
		statusId: null,
		assignee: null,
		priorityId: null,
		startDate: null,
		endDate: null,
	},
	filterButtonState: 0
}

export const boardScheduleSlice = createSlice({
	name: "boardSchedule",
	initialState,
	reducers: {
		setData(state, action: PayloadAction<SchedulerData>){
			state.data = action.payload
		},
		setFilters(state, action: PayloadAction<BoardScheduleFilters>){
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
	setData,
	setFilters,
	setFilterButtonState,
} = boardScheduleSlice.actions
export const boardScheduleReducer = boardScheduleSlice.reducer 
