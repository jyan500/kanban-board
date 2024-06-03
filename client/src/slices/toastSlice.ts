import { createSlice, current } from '@reduxjs/toolkit'
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
    addToast: (
      state,
      action: PayloadAction<Toast>,
    ) => {
    	state.toasts.push(action.payload)
    },
    updateToast: (state, action: PayloadAction<{toast: Toast, toastId: string}>) => {
        const { toastId, toast } = action.payload
        const index = state.toasts.findIndex((toast: Toast) => toast.id === toastId)
        if (index >= 0){
            state.toasts.splice(index, 1, toast)
        }
    },
    removeToast: (
        state,
        action: PayloadAction<string>,
    ) => {
        const index = state.toasts.findIndex((toast: Toast) => toast.id === action.payload)
        if (index >= 0){
            state.toasts.splice(index, 1)
        }
    }
  },
})

export const { 
    addToast, 
    removeToast, 
    updateToast, 
} = toastSlice.actions

export const toastReducer = toastSlice.reducer
