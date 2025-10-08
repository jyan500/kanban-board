import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { logout } from "./authSlice"

export interface NotificationFilters {
	notificationType: string | null | undefined
	userId: number | null | undefined
	dateFrom: string | null | undefined
	dateTo: string | null | undefined
	isUnread: string | null | undefined
}

interface NotificationFilterState {
	filters: NotificationFilters
	filterButtonState: boolean
}

const initialState: NotificationFilterState = {
	filters: {
		notificationType: null,
		userId: null,
		dateFrom: null,
		dateTo: null,
		isUnread: null,
	},
	filterButtonState: false,
}

export const notificationFilterSlice = createSlice({
	name: "notificationFilter",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<NotificationFilters>){
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
} = notificationFilterSlice.actions

export const notificationFilterReducer = notificationFilterSlice.reducer


