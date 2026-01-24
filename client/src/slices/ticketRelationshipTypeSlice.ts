import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { TicketRelationshipType, OptionType } from "../types/common"
import { logout } from "./authSlice"

type TicketRelationshipTypeState = {
	ticketRelationshipTypes: Array<TicketRelationshipType>
    ticketRelationshipTypesForSelect: Array<OptionType>
}

const initialState: TicketRelationshipTypeState = {
	ticketRelationshipTypes: [],
	ticketRelationshipTypesForSelect: [],
}

const ticketRelationshipTypeSlice = createSlice({
    name: 'TicketRelationshipTypes',
    initialState,
    reducers: {
        setTicketRelationshipTypes: (state, { payload: { ticketRelationshipTypes }}: PayloadAction<{ ticketRelationshipTypes: Array<TicketRelationshipType> }>) => {
            state.ticketRelationshipTypes = ticketRelationshipTypes
            state.ticketRelationshipTypesForSelect = ticketRelationshipTypes.map((type) => (
                {
                    label: type.name,
                    value: type.id.toString()
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

export const { setTicketRelationshipTypes } = ticketRelationshipTypeSlice.actions

export const ticketRelationshipTypeReducer = ticketRelationshipTypeSlice.reducer
