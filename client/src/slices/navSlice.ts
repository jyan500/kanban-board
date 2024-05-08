import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

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
})

export const { toggleSideBar } = navSlice.actions

export const navReducer = navSlice.reducer
