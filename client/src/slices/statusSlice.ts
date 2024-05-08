import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Status } from "../types/common"

type StatusState = {
	statuses: Array<Status>
}

const initialState: StatusState = {
	statuses: [],
}

const statusSlice = createSlice({
  name: 'statuses',
  initialState,
  reducers: {
    setStatuses: (
      state,
      {
        payload: { statuses },
      }: PayloadAction<{ statuses: Array<Status> }>,
    ) => {
    	state.statuses = statuses
    },
  },
})

export const { setStatuses } = statusSlice.actions

export const statusReducer = statusSlice.reducer
