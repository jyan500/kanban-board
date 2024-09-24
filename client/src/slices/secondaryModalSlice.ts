import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import { secondaryModalTypes } from "../components/SecondaryModal"
import { logout } from "./authSlice" 

interface SecondaryModalState<T={}> {
	showSecondaryModal: boolean
	currentSecondaryModalType: keyof typeof secondaryModalTypes | undefined
	currentSecondaryModalProps: T
}

const initialState: SecondaryModalState = {
	showSecondaryModal: false,
	currentSecondaryModalType: undefined,
	currentSecondaryModalProps: {}

}

export const secondaryModalSlice = createSlice({
	name: "secondaryModal",
	initialState,
	reducers: {
		toggleShowSecondaryModal(state, action: PayloadAction<boolean>){
			state.showSecondaryModal = action.payload
		},
		setSecondaryModalType(state, action: PayloadAction<keyof typeof secondaryModalTypes | undefined>){
			state.currentSecondaryModalType = action.payload	
		},
		setSecondaryModalProps: <T>(state: SecondaryModalState<T>, action: PayloadAction<T>) => {
			state.currentSecondaryModalProps = action.payload
		}
	},
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { 
	setSecondaryModalType, 
	toggleShowSecondaryModal,
	setSecondaryModalProps
} = secondaryModalSlice.actions
export const secondaryModalReducer = secondaryModalSlice.reducer 