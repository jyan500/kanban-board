import { createSlice, current } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Toast } from "../types/common"
import { logout } from "./authSlice"

type ToastState = {
    toasts: Array<Toast>
    position: string
}

const initialState: ToastState = {
    toasts: [],
    position: "bottom-right"
}

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<Toast>) => {
            state.toasts.push(action.payload)
        },
        updateToast: (state, action: PayloadAction<{toast: Toast, toastId: string}>) => {
            const { toastId, toast } = action.payload
            const index = state.toasts.findIndex((toast: Toast) => toast.id === toastId)
            if (index >= 0){
                state.toasts.splice(index, 1, toast)
            }
        },
        removeToast: (state, action: PayloadAction<string>) => {
            const index = state.toasts.findIndex((toast: Toast) => toast.id === action.payload)
            if (index >= 0){
                state.toasts.splice(index, 1)
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { 
    addToast, 
    removeToast, 
    updateToast, 
} = toastSlice.actions

export const toastReducer = toastSlice.reducer
