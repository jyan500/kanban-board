import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { setModalType, setModalProps, toggleShowModal } from "../slices/modalSlice" 
import { AddTicketFormModal } from "./primary-modals/AddTicketFormModal" 
import { EditTicketFormModal } from "./primary-modals/EditTicketFormModal" 
import { EditUserFormModal } from "./primary-modals/EditUserFormModal"
import { BoardForm } from "./BoardForm" 
import { BoardStatusModal } from "./primary-modals/BoardStatusModal"
import { OrganizationStatusModal } from "./primary-modals/OrganizationStatusModal"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { PRIMARY_MODAL_Z_INDEX, LG_BREAKPOINT } from "../helpers/constants"
import { useScreenSize } from "../hooks/useScreenSize"

export const modalTypes = {
	"ADD_TICKET_FORM": AddTicketFormModal,
	"EDIT_TICKET_FORM": EditTicketFormModal,
	"BOARD_STATUS_FORM": BoardStatusModal,
	"ORGANIZATION_STATUS_FORM": OrganizationStatusModal,
	"BOARD_FORM": BoardForm,
	"USER_FORM": EditUserFormModal,
}

export const modalClassNames = {
	// "ADD_TICKET_FORM": "--l-modal tw-top-[50%]",
	// "EDIT_TICKET_FORM": "--l-modal tw-top-[50%]",
	// "ORGANIZATION_STATUS_FORM": "--l-modal-height tw-top-[50%]"
	"ADD_TICKET_FORM": "--l-modal-height tw-top-[50%]",
	"EDIT_TICKET_FORM": "--l-modal-height tw-top-[50%]",
	"ORGANIZATION_STATUS_FORM": "--l-modal-height tw-top-[50%]"
}

// type for partial subset of keys
type PartialKeys<T> = Partial<{ [K in keyof T]: Record<string, any>}>

export const Modal = () => {
	const dispatch = useAppDispatch()
	const { currentModalType, showModal, currentModalProps }  = useAppSelector((state) => state.modal)
	const ModalContent = modalTypes[currentModalType as keyof typeof modalTypes] as React.FC 
	const { width, height } = useScreenSize()
	const style = {
		width: `${width <= LG_BREAKPOINT ? width-40 : LG_BREAKPOINT }px`
	}

	// define modal handlers type as the partial subset of all keys of modal types
	const modalHandlers: PartialKeys<typeof modalTypes> = {
		"ADD_TICKET_FORM": {
			dismissHandler: () => {
				dispatch(toggleShowModal(false))
				dispatch(setModalType(undefined))
				dispatch(setModalProps({}))
				dispatch(selectCurrentTicketId(null))
			}
		},
		"EDIT_TICKET_FORM": {
			dismissHandler: () => {
				dispatch(toggleShowModal(false))
				dispatch(setModalType(undefined))
				dispatch(setModalProps({}))
				dispatch(selectCurrentTicketId(null))
			}
		},
	} 

	return (
		<div className = {`${PRIMARY_MODAL_Z_INDEX} overlay ${showModal ? "--visible": "--hidden"}`}>
			<div style = {style} className = {`${currentModalType && currentModalType in modalClassNames ? modalClassNames[currentModalType as keyof typeof modalClassNames] : "tw-top-[30%]"} modal-container`}>
				<button 
				className = "__modal-container-close --transparent"
				onClick={
					() => {
						if (currentModalType && modalHandlers[currentModalType as keyof typeof modalHandlers]?.dismissHandler){
							modalHandlers[currentModalType as keyof typeof modalHandlers]?.dismissHandler()
						}
						else {
							dispatch(toggleShowModal(false))
							dispatch(setModalType(undefined))
							dispatch(setModalProps({}))
						}
					}
				}
				>
					<IoMdClose className = "icon"/>
				</button>
				<div className = "modal">
					<div className = "modal-content">
						{
							ModalContent ? <ModalContent {...currentModalProps} /> : null
						}
					</div>
				</div>
			</div>	
		</div>
	)	
}