import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { OptionType, Priority } from "../types/common"
import { logout } from "./authSlice"

type PriorityState = {
	priorities: Array<Priority>
    prioritiesForSelect: Array<OptionType>
}

const initialState: PriorityState = {
	priorities: [],
    prioritiesForSelect: [],
}

const prioritySlice = createSlice({
    name: 'priority',
    initialState,
    reducers: {
        setPriorities: (state, {payload: { priorities }}: PayloadAction<{ priorities: Array<Priority> }>) => {
        	state.priorities = priorities 
            state.prioritiesForSelect = priorities.map((priority) => (
                {
                    label: priority.name,
                    value: priority.id.toString()
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

export const { setPriorities } = prioritySlice.actions

export const priorityReducer = prioritySlice.reducer
