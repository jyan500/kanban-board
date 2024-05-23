import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Toast } from "../types/common"

type ToastState = {
    toasts: Array<Toast>
    autoClose: number
}

const initialState: ToastState = {
    toasts: [],
    autoClose: 5000
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
    addToast: (
        state,
        action: PayloadAction<Toast>,
    ) => {
        state.toasts.push(action.payload) 
        // setTimeout(() => {
        //     state.toasts.unshift()
        // }, state.autoClose)
    }
  },
})

export const { setToasts, addToast } = toastSlice.actions

export const toastReducer = toastSlice.reducer
