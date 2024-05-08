import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { TicketType } from "../types/common"

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
    setTicketTypes: (
      state,
      {
        payload: { ticketTypes },
      }: PayloadAction<{ ticketTypes: Array<TicketType> }>,
    ) => {
    	state.ticketTypes = ticketTypes
    },
  },
})

export const { setTicketTypes } = ticketTypeSlice.actions

export const ticketTypeReducer = ticketTypeSlice.reducer
