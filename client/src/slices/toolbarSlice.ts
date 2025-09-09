import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

interface ToolbarState {
	showToolbar: boolean
	currentToolbarType: string | undefined
	currentToolbarProps: Record<string, any>
	itemIds: Array<number>
}

const initialState: ToolbarState = {
	showToolbar: false,
	currentToolbarType: undefined,
	currentToolbarProps: {},
	itemIds: [],
}

export const toolbarSlice = createSlice({
	name: "toolbar",
	initialState,
	reducers: {
		toggleShowToolbar(state, action: PayloadAction<boolean>){
			state.showToolbar = action.payload
		},
		setToolbarType(state, action: PayloadAction<string | undefined>){
			state.currentToolbarType = action.payload	
		},
		setToolbarProps(state, action: PayloadAction<Record<string, any>>){
			state.currentToolbarProps = action.payload
		},
		setItemIds(state, action: PayloadAction<Array<number>>){
			state.itemIds = action.payload
		}
	},
})

export const {
	setToolbarType,
	setToolbarProps,
	toggleShowToolbar,
	setItemIds,
} = toolbarSlice.actions
export const toolbarReducer = toolbarSlice.reducer
