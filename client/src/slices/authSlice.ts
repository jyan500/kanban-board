import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

type AuthState = {
    token: string | null,
    isTemp: boolean,
}

const initialState: AuthState = {
	token: localStorage.getItem("token") ?? null,
    isTemp: localStorage.getItem("isTemp") === "true" ? true : false, 
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem("token")
            localStorage.removeItem("isTemp")
            localStorage.removeItem("tooltipVisibility")
            localStorage.removeItem("isDarkMode")
            state.token = null
            state.isTemp = false
        },
        setCredentials: (state, {payload: { token, isTemp }}: PayloadAction<{ token: string, isTemp?: boolean }>) => {
            localStorage.setItem("token", token)
            localStorage.setItem("isTemp", isTemp ? "true" : "false")
            state.token = token
            state.isTemp = isTemp ?? false
        },
    },
})

export const { logout, setCredentials } = authSlice.actions

export const authReducer = authSlice.reducer
