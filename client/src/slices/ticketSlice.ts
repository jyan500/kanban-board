import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Ticket } from "../types/common"

type ticketState = {
  tickets: Array<Ticket>
}

const initialState: ticketState = {
	tickets: [],
}

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    setTicket: (
      state,
      {
        payload: { tickets },
      }: PayloadAction<{ tickets: Array<Ticket> }>,
    ) => {
    	state.tickets = tickets
    },
  },
})

export const { setTicket } = ticketSlice.actions

export const ticketReducer = ticketSlice.reducer
