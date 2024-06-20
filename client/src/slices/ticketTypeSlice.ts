import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { TicketType } from "../types/common"
import { logout } from "./authSlice"

type TicketTypeState = {
	ticketTypes: Array<TicketType>
}

const initialState: TicketTypeState = {
	ticketTypes: [],
}

const ticketTypeSlice = createSlice({
    name: 'TicketTypes',
    initialState,
    reducers: {
        setTicketTypes: (state, { payload: { ticketTypes }}: PayloadAction<{ ticketTypes: Array<TicketType> }>) => {
            state.ticketTypes = ticketTypes
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setTicketTypes } = ticketTypeSlice.actions

export const ticketTypeReducer = ticketTypeSlice.reducer
