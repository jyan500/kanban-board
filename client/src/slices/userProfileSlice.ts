import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { UserProfile } from "../types/common"
import { logout } from "./authSlice"

type UserProfileState = {
	userProfile: UserProfile | null,
    userProfiles: Array<UserProfile>
}

const initialState: UserProfileState = {
	userProfile: null,
    userProfiles: []
}

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {
      	setUserProfile: (state, { payload: { userProfile }}: PayloadAction<{ userProfile: UserProfile }>,
        ) => {
            state.userProfile = userProfile
        },
        setUserProfiles: (state, { payload: { userProfiles }}: PayloadAction<{ userProfiles: Array<UserProfile>}>,
        ) => {
            state.userProfiles = userProfiles
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setUserProfile, setUserProfiles } = userProfileSlice.actions

export const userProfileReducer = userProfileSlice.reducer
