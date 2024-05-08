import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Priority } from "../types/common"

type PriorityState = {
	priorities: Array<Priority>
}

const initialState: PriorityState = {
	priorities: [],
}

const prioritySlice = createSlice({
  name: 'priority',
  initialState,
  reducers: {
    setPriorities: (
      state,
      {
        payload: { priorities },
      }: PayloadAction<{ priorities: Array<Priority> }>,
    ) => {
    	state.priorities = priorities 
    },
  },
})

export const { setPriorities } = prioritySlice.actions

export const priorityReducer = prioritySlice.reducer
