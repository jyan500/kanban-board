import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { OptionType, Status } from "../types/common"
import { logout } from "./authSlice"

type StatusState = {
	statuses: Array<Status>
    statusesForSelect: Array<OptionType>
}

const initialState: StatusState = {
	statuses: [],
    statusesForSelect: [],
}

const statusSlice = createSlice({
    name: 'statuses',
    initialState,
    reducers: {
        setStatuses: (state, { payload: { statuses }}: PayloadAction<{ statuses: Array<Status> }>) => {
        	state.statuses = statuses
            state.statusesForSelect = statuses.map((status) => (
                {
                    label: status.name,
                    value: status.id.toString()
                }
            ))
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setStatuses } = statusSlice.actions

export const statusReducer = statusSlice.reducer
