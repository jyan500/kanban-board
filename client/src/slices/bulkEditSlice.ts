import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import { logout } from "./authSlice" 

interface BulkEditState {
	displayToolbar: boolean 
	ids: Array<number>
	selectAll: boolean
}

const initialState: BulkEditState = {
	displayToolbar: false,
	ids: [],
	selectAll: false
}

export const bulkEditSlice = createSlice({
	name: "bulkEdit",
	initialState,
	reducers: {
		toggleToolbar: (state: BulkEditState, action: PayloadAction<boolean>) => {
			state.displayToolbar = action.payload
		},
		updateIds: (state: BulkEditState, action: PayloadAction<Array<number>>) => {
			state.ids = action.payload
		},
		toggleSelectAll: (state: BulkEditState, action: PayloadAction<boolean>) => {
			state.selectAll = action.payload	
		}
	},
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { 
	toggleToolbar,
	toggleSelectAll,
	updateIds,
} = bulkEditSlice.actions
export const bulkEditReducer = bulkEditSlice.reducer 