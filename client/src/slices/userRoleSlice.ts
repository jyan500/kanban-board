import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { UserRole, OptionType } from "../types/common"
import { parseDelimitedWord } from "../helpers/functions"
import { logout } from "./authSlice"

type UserRoleState = {
    userRoles: Array<UserRole>
    userRoleLookup: {[id: number]: string} 
    userRolesForSelect: Array<OptionType>
}

const initialState: UserRoleState = {
    userRoles: [],
    userRoleLookup: {},
    userRolesForSelect: [],
}

const userRoleSlice = createSlice({
    name: 'userRole',
    initialState,
    reducers: {
        setUserRoles: (state, { payload: { userRoles }}: PayloadAction<{ userRoles: Array<UserRole>}>,
        ) => {
          state.userRoles = userRoles
          state.userRolesForSelect = userRoles.map((userRole) => ({
            label: parseDelimitedWord(userRole.name, "_"),
            value: userRole.id.toString()
          }))
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
