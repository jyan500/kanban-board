import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { TicketRelationshipType } from "../types/common"
import { logout } from "./authSlice"

type TicketRelationshipTypeState = {
	ticketRelationshipTypes: Array<TicketRelationshipType>
}

const initialState: TicketRelationshipTypeState = {
	ticketRelationshipTypes: [],
}

const ticketRelationshipTypeSlice = createSlice({
    name: 'TicketRelationshipTypes',
    initialState,
    reducers: {
        setTicketRelationshipTypes: (state, { payload: { ticketRelationshipTypes }}: PayloadAction<{ ticketRelationshipTypes: Array<TicketRelationshipType> }>) => {
            state.ticketRelationshipTypes = ticketRelationshipTypes
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
