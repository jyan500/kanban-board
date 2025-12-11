import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { setCurrentBoardId } from "../slices/boardInfoSlice"
import { setModalType, setModalProps, toggleShowModal } from "../slices/modalSlice" 
import { AddTicketFormModal } from "./primary-modals/AddTicketFormModal" 
import { EditTicketFormModal } from "./primary-modals/EditTicketFormModal" 
import { EditUserFormModal } from "./primary-modals/EditUserFormModal"
import { BoardForm } from "./BoardForm" 
import { ProjectForm } from "./forms/ProjectForm"
import { SprintForm } from "./forms/SprintForm"
import { CompleteSprintForm } from "./forms/CompleteSprintForm"
import { BoardStatusModal } from "./primary-modals/BoardStatusModal"
import { OrganizationStatusModal } from "./primary-modals/OrganizationStatusModal"
import { BulkActionsModal } from "./primary-modals/BulkActionsModal"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { PRIMARY_MODAL_Z_INDEX, LG_BREAKPOINT } from "../helpers/constants"
import { useScreenSize } from "../hooks/useScreenSize"
import { avoidAsyncSelectMenuOverflow } from "./SecondaryModal"
import { getModalWidth } from "../helpers/functions"

const defaultConfig = {"type": "large", "modal-container": "--l-modal-height tw-top-[50%]", "modal": ""}
const withOverflow = {...defaultConfig, "modal": "tw-overflow-y-auto"}

export const modalTypes = {
	"ADD_TICKET_FORM": AddTicketFormModal,
	"EDIT_TICKET_FORM": EditTicketFormModal,
	"BOARD_STATUS_FORM": BoardStatusModal,
	"ORGANIZATION_STATUS_FORM": OrganizationStatusModal,
	"BOARD_FORM": BoardForm,
	"PROJECT_FORM": ProjectForm,
	"SPRINT_FORM": SprintForm,
	"USER_FORM": EditUserFormModal,
	"BULK_ACTIONS_MODAL": BulkActionsModal,
	"COMPLETE_SPRINT_FORM": CompleteSprintForm,
}

export const modalClassNames = {
	// "ADD_TICKET_FORM": "--l-modal tw-top-[50%]",
	// "EDIT_TICKET_FORM": "--l-modal tw-top-[50%]",
	// "ORGANIZATION_STATUS_FORM": "--l-modal-height tw-top-[50%]"
	"ADD_TICKET_FORM": defaultConfig,
	"EDIT_TICKET_FORM": withOverflow,
	"ORGANIZATION_STATUS_FORM": defaultConfig,
	"BOARD_FORM": avoidAsyncSelectMenuOverflow,
	"PROJECT_FORM": avoidAsyncSelectMenuOverflow,
	"BULK_ACTIONS_MODAL": defaultConfig,
	"SPRINT_FORM": avoidAsyncSelectMenuOverflow,
	"COMPLETE_SPRINT_FORM": avoidAsyncSelectMenuOverflow,
}

// type for partial subset of keys
type PartialKeys<T> = Partial<{ [K in keyof T]: Record<string, any>}>

export const Modal = () => {
	const dispatch = useAppDispatch()
	const { currentModalType, showModal, currentModalProps }  = useAppSelector((state) => state.modal)
	const ModalContent = modalTypes[currentModalType as keyof typeof modalTypes] as React.FC 
	const modalContainerClassName = currentModalType != null && currentModalType in modalClassNames ? modalClassNames[currentModalType as keyof typeof modalClassNames]["modal-container"] : ""
	const modalClassName = currentModalType != null && currentModalType in modalClassNames ? modalClassNames[currentModalType as keyof typeof modalClassNames]["modal"] : ""
	const type = currentModalType != null && currentModalType in modalClassNames ? modalClassNames[currentModalType as keyof typeof modalClassNames]["type"] : ""
	const { width, height } = useScreenSize()
	const style = {
		width: getModalWidth(width, type) 
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
		"BOARD_FORM": {
			dismissHandler: () => {
				dispatch(toggleShowModal(false))
				dispatch(setModalType(undefined))
				dispatch(setModalProps({}))
			}
		}

	} 

	return (
		<div className = {`${PRIMARY_MODAL_Z_INDEX} overlay ${showModal ? "--visible": "--hidden"}`}>
			<div style={style} className = {`${modalContainerClassName !== "" ? modalContainerClassName : "tw-top-[30%]"} modal-container`}>
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
				<div className = {`${modalClassName} modal`}>
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