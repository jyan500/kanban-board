import { createSlice, current } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import { modalTypes } from "../components/Modal"

interface ModalState {
	showModal: boolean
	currentModalType: keyof typeof modalTypes
	currentModalProps: Record<string, any>
}

const initialState: ModalState = {
	showModal: false,
	currentModalType: "TICKET_FORM",
	currentModalProps: {},
}

export const modalSlice = createSlice({
	name: "modal",
	initialState,
	reducers: {
		toggleShowModal(state, action: PayloadAction<boolean>){
			state.showModal = action.payload
		},
		setModalType(state, action: PayloadAction<keyof typeof modalTypes>){
			state.currentModalType = action.payload	
		},
		setModalProps(state, action: PayloadAction<Record<string, any>>){
			state.currentModalProps = action.payload
		},
	}
})

export const { 
	setModalType, 
	setModalProps,
	toggleShowModal 
} = modalSlice.actions
export const modalReducer = modalSlice.reducer 