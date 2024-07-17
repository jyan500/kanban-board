import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { UserRole } from "../types/common"
import { logout } from "./authSlice"

type UserRoleState = {
    userRoles: Array<UserRole>
    userRoleLookup: {[id: number]: string} 
}

const initialState: UserRoleState = {
    userRoles: [],
    userRoleLookup: {},
}

const userRoleSlice = createSlice({
    name: 'userRole',
    initialState,
    reducers: {
        setUserRoles: (state, { payload: { userRoles }}: PayloadAction<{ userRoles: Array<UserRole>}>,
        ) => {
          state.userRoles = userRoles
        },
        setUserRoleLookup: (state, action: PayloadAction<{[id: number]: string}>) => {
            state.userRoleLookup = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setUserRoles, setUserRoleLookup } = userRoleSlice.actions

export const userRoleReducer = userRoleSlice.reducer
