import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { NotificationType, OptionType } from "../types/common"
import { logout } from "./authSlice"

type NotificationTypeState = {
	notificationTypes: Array<NotificationType>
    notificationTypesForSelect: Array<OptionType>
}

const initialState: NotificationTypeState = {
	notificationTypes: [],
    notificationTypesForSelect: [],
}

const notificationTypeSlice = createSlice({
    name: 'notificationType',
    initialState,
    reducers: {
        setNotificationTypes: (state, { payload: { notificationTypes }}: PayloadAction<{ notificationTypes: Array<NotificationType> }>) => {
            state.notificationTypes = notificationTypes
            state.notificationTypesForSelect = notificationTypes.map((notificationType) => ({
                label: notificationType.name,
                value: notificationType.id.toString()
            }))
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
