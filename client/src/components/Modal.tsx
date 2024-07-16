import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { TicketForm } from "./TicketForm" 
import { StatusForm } from "./StatusForm" 
import { BoardForm } from "./BoardForm" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 

export const modalTypes = {
	"TICKET_FORM": TicketForm,
	"STATUS_FORM": StatusForm,
	"BOARD_FORM": BoardForm,
}

// type for partial subset of keys
type PartialKeys<T> = Partial<{ [K in keyof T]: Record<string, any>}>

export const Modal = () => {
	const dispatch = useAppDispatch()
	const { currentModalType, showModal }  = useAppSelector((state) => state.modal)
	const ModalContent = modalTypes[currentModalType as keyof typeof modalTypes] 

	// define modal handlers type as the partial subset of all keys of modal types
	const modalHandlers: PartialKeys<typeof modalTypes> = {
		"TICKET_FORM": {
			dismissHandler: () => {
				dispatch(toggleShowModal(false))
				dispatch(selectCurrentTicketId(null))
			}
		},
	} 

	return (
		<div className = {`overlay ${showModal ? "--visible": "--hidden"}`}>
			<div className = "modal-container">
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
				<IoMdClose className = "icon"/></button>
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