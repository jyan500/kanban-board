import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Toast } from "../types/common"

type ToastState = {
    toasts: Array<Toast>
}

const initialState: ToastState = {
    toasts: [],
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToasts: (
      state,
      action: PayloadAction<Array<Toast>>,
    ) => {
    	state.toasts = action.payload
    },
  },
})

export const { setToasts } = toastSlice.actions

export const toastReducer = toastSlice.reducer
