import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import "../styles/common.css"
import { toggleShowModal, selectCurrentTicketId } from "../slices/boardSlice"
import { TicketForm } from "./TicketForm" 
import { StatusForm } from "./StatusForm" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 

export const modalTypes = {
	"TICKET_FORM": TicketForm,
	"STATUS_FORM": StatusForm,
}

// type for partial subset of keys
type PartialKeys<T> = Partial<{ [K in keyof T]: Record<string, any>}>

export const Modal = () => {
	const dispatch = useAppDispatch()
	const board = useAppSelector((state) => state.board)
	const ModalContent = modalTypes[board.currentModalType as keyof typeof modalTypes] 

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
		<div className = {`overlay ${board.showModal ? "visible": "hidden"}`}>
			<div className = "modal-container">
				<button onClick={
					() => {
						if (modalHandlers[board.currentModalType as keyof typeof modalHandlers]?.dismissHandler){
							modalHandlers[board.currentModalType as keyof typeof modalHandlers]?.dismissHandler()
						}
						else {
							dispatch(toggleShowModal(false))
						}
					}
				}
				>
					<IoMdClose className = "close-button"/></button>
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