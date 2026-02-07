import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

type DarkModeState = {
    isDarkMode: boolean
}

const initialState: DarkModeState = {
    isDarkMode: false
}

const darkModeSlice = createSlice({
    name: 'darkMode',
    initialState,
    reducers: {
        setDarkMode: (state, {payload: { isDarkMode }}: PayloadAction<{ isDarkMode: boolean }>) => {
            state.isDarkMode = isDarkMode
        },
    },
})

export const { setDarkMode } = darkModeSlice.actions

export const darkModeReducer = darkModeSlice.reducer
