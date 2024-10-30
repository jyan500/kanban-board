import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../slices/secondaryModalSlice" 
import { DeleteCommentWarning } from "./secondary-modals/DeleteCommentWarning"
import { UnlinkTicketWarning } from "./secondary-modals/UnlinkTicketWarning"
import { DeleteTicketWarning } from "./secondary-modals/DeleteTicketWarning" 
import { AddToEpicFormModal } from "./secondary-modals/AddToEpicFormModal"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SECONDARY_MODAL_Z_INDEX } from "../helpers/constants"

export const secondaryModalTypes = {
	"SHOW_DELETE_COMMENT_WARNING": DeleteCommentWarning,
	"SHOW_UNLINK_TICKET_WARNING": UnlinkTicketWarning,
	"DELETE_TICKET_WARNING": DeleteTicketWarning,
	"ADD_TO_EPIC_FORM_MODAL": AddToEpicFormModal
}

export const secondaryModalClassNames = {
	"ADD_TO_EPIC_FORM_MODAL": {"modal-container": "tw-top-[50%] --m-modal", "modal": "!tw-overflow-visible tw-min-h-96"},
}

export const SecondaryModal = () => {
	const dispatch = useAppDispatch()
	const { currentSecondaryModalType, showSecondaryModal, currentSecondaryModalProps }  = useAppSelector((state) => state.secondaryModal)
	const ModalContent = secondaryModalTypes[currentSecondaryModalType as keyof typeof secondaryModalTypes] as React.FC
	const modalContainerClassName = currentSecondaryModalType != null && currentSecondaryModalType in secondaryModalClassNames ? secondaryModalClassNames[currentSecondaryModalType as keyof typeof secondaryModalClassNames]["modal-container"] : ""
	const modalClassName = currentSecondaryModalType != null && currentSecondaryModalType in secondaryModalClassNames ? secondaryModalClassNames[currentSecondaryModalType as keyof typeof secondaryModalClassNames]["modal"] : ""

	return (
		<div className = {`${SECONDARY_MODAL_Z_INDEX} !tw-bg-black/50 overlay ${showSecondaryModal ? "--visible" : "--hidden"}`}>
			<div className = {`${modalContainerClassName !== "" ? modalContainerClassName : "tw-top-[30%]"} modal-container`}>
				<button 
				className = "__modal-container-close --transparent"
				onClick={
					() => {
						dispatch(toggleShowSecondaryModal(false))
						dispatch(setSecondaryModalProps({}))
						dispatch(setSecondaryModalType(undefined))
					}
				}
				>
					<IoMdClose className = "icon"/>
				</button>
				<div className = {`${modalClassName} modal`}>
					<div className = "modal-content">
						{
							ModalContent ? (
								<ModalContent {...currentSecondaryModalProps} />) : null
						}
					</div>
				</div>
			</div>	
		</div>
	)	
}