import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type TooltipKeys = {
    "ai-features": boolean
}

type TooltipState = {
    visibility: TooltipKeys
}

const initialState: TooltipState = {
    visibility: {
        "ai-features": true,
    }
}

const tooltipSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setVisibility: (state, action: PayloadAction<{tooltipKey: keyof TooltipKeys, value: boolean}>) => {
            state.visibility = {...state.visibility, [action.payload.tooltipKey]: action.payload.value}
        },
    },
})

export const { setVisibility } = tooltipSlice.actions

export const tooltipReducer = tooltipSlice.reducer
