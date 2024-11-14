import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import { modalTypes } from "../components/Modal"
import { logout } from "./authSlice" 

interface ModalState {
	showModal: boolean
	currentModalType: keyof typeof modalTypes | undefined
	currentModalProps: Record<string, any>
}

const initialState: ModalState = {
	showModal: false,
	currentModalType: undefined,
	currentModalProps: {},
}

export const modalSlice = createSlice({
	name: "modal",
	initialState,
	reducers: {
		toggleShowModal(state, action: PayloadAction<boolean>){
			state.showModal = action.payload
		},
		setModalType(state, action: PayloadAction<keyof typeof modalTypes | undefined>){
			state.currentModalType = action.payload	
		},
		setModalProps(state, action: PayloadAction<Record<string, any>>){
			state.currentModalProps = action.payload
		},
	},
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { 
	setModalType, 
	setModalProps,
	toggleShowModal 
} = modalSlice.actions
export const modalReducer = modalSlice.reducer 