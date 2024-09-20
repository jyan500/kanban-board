import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { AddTicketForm } from "./AddTicketForm" 
import { EditTicketForm } from "./EditTicketForm" 
import { StatusForm } from "./StatusForm" 
import { BoardForm } from "./BoardForm" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { PRIMARY_MODAL_Z_INDEX } from "../helpers/constants"

export const modalTypes = {
	"ADD_TICKET_FORM": AddTicketForm,
	"EDIT_TICKET_FORM": EditTicketForm,
	"STATUS_FORM": StatusForm,
	"BOARD_FORM": BoardForm,
}

export const modalClassNames = {
	"ADD_TICKET_FORM": "--l-modal tw-top-[50%]",
	"EDIT_TICKET_FORM": "--l-modal tw-top-[50%]",
}

// type for partial subset of keys
type PartialKeys<T> = Partial<{ [K in keyof T]: Record<string, any>}>

export const Modal = () => {
	const dispatch = useAppDispatch()
	const { currentModalType, showModal }  = useAppSelector((state) => state.modal)
	const ModalContent = modalTypes[currentModalType as keyof typeof modalTypes] 

	// define modal handlers type as the partial subset of all keys of modal types
	const modalHandlers: PartialKeys<typeof modalTypes> = {
		"ADD_TICKET_FORM": {
			dismissHandler: () => {
				dispatch(toggleShowModal(false))
				dispatch(selectCurrentTicketId(null))
			}
		},
		"EDIT_TICKET_FORM": {
			dismissHandler: () => {
				dispatch(toggleShowModal(false))
				dispatch(selectCurrentTicketId(null))
			}
		},
	} 

	return (
		<div className = {`${PRIMARY_MODAL_Z_INDEX} overlay ${showModal ? "--visible": "--hidden"}`}>
			<div className = {`${currentModalType in modalClassNames ? modalClassNames[currentModalType as keyof typeof modalClassNames] : "tw-top-[30%]"} modal-container`}>
				<button 
				className = "__modal-container-close --transparent"
				onClick={
					() => {
						if (modalHandlers[currentModalType as keyof typeof modalHandlers]?.dismissHandler){
							modalHandlers[currentModalType as keyof typeof modalHandlers]?.dismissHandler()
						}
						else {
							dispatch(toggleShowModal(false))
						}
					}
				}
				>
					<IoMdClose className = "icon"/>
				</button>
				<div className = "modal">
					<div className = "modal-content">
						{
							ModalContent ? <ModalContent/> : null
						}
					</div>
				</div>
			</div>	
		</div>
	)	
}