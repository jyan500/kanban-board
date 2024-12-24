import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { NotificationType } from "../types/common"
import { logout } from "./authSlice"

type NotificationTypeState = {
	notificationTypes: Array<NotificationType>
}

const initialState: NotificationTypeState = {
	notificationTypes: [],
}

const notificationTypeSlice = createSlice({
    name: 'notificationType',
    initialState,
    reducers: {
        setNotificationTypes: (state, { payload: { notificationTypes }}: PayloadAction<{ notificationTypes: Array<NotificationType> }>) => {
            state.notificationTypes = notificationTypes
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setNotificationTypes } = notificationTypeSlice.actions

export const notificationTypeReducer = notificationTypeSlice.reducer
