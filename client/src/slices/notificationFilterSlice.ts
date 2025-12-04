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
}

const initialState: NotificationFilterState = {
	filters: {
		notificationType: null,
		userId: null,
		dateFrom: null,
		dateTo: null,
		isUnread: null,
	},
}

export const notificationFilterSlice = createSlice({
	name: "notificationFilter",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<NotificationFilters>){
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
} = notificationFilterSlice.actions

export const notificationFilterReducer = notificationFilterSlice.reducer


