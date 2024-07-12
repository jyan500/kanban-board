import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { UserRole } from "../types/common"
import { logout } from "./authSlice"

type UserRoleState = {
    userRoles: Array<UserRole>
}

const initialState: UserRoleState = {
    userRoles: []
}

const userRoleSlice = createSlice({
    name: 'userRole',
    initialState,
    reducers: {
        setUserRoles: (state, { payload: { userRoles }}: PayloadAction<{ userRoles: Array<UserRole>}>,
        ) => {
          state.userRoles = userRoles
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setUserRoles } = userRoleSlice.actions

export const userRoleReducer = userRoleSlice.reducer
