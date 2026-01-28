import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { TicketType, OptionType } from "../types/common"
import { logout } from "./authSlice"

type TicketTypeState = {
	ticketTypes: Array<TicketType>
    ticketTypesForSelect: Array<OptionType>
}

const initialState: TicketTypeState = {
	ticketTypes: [],
    ticketTypesForSelect: []
}

const ticketTypeSlice = createSlice({
    name: 'TicketTypes',
    initialState,
    reducers: {
        setTicketTypes: (state, { payload: { ticketTypes }}: PayloadAction<{ ticketTypes: Array<TicketType> }>) => {
            state.ticketTypes = ticketTypes
            state.ticketTypesForSelect = ticketTypes.map((ticketType) => (
                {
                    label: ticketType.name,
                    value: ticketType.id.toString(),
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

export const { setTicketTypes } = ticketTypeSlice.actions

export const ticketTypeReducer = ticketTypeSlice.reducer
