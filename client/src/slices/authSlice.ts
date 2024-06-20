import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { privateApi } from "../services/private"

type AuthState = {
    token: string | null
}

const initialState: AuthState = {
	token: localStorage.getItem("token") ?? null 
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem("token")
            state.token = null
            privateApi.util.resetApiState()
        },
        setCredentials: (state, {payload: { token }}: PayloadAction<{ token: string }>) => {
            localStorage.setItem("token", token)
            state.token = token
        },
    },
})

export const { logout, setCredentials } = authSlice.actions

export const authReducer = authSlice.reducer
