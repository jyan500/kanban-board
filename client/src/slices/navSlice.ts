import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { logout } from "./authSlice"

type NavState = {
  showSidebar: boolean 
}

const initialState: NavState = {
	showSidebar: false
}

const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
    	toggleSideBar(state, action: PayloadAction<boolean>){
    		state.showSidebar = action.payload
    	}
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { toggleSideBar } = navSlice.actions

export const navReducer = navSlice.reducer
