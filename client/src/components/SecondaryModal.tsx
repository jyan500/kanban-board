import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../slices/secondaryModalSlice" 
import { DeleteCommentWarning } from "./secondary-modals/DeleteCommentWarning"
import { UnlinkTicketWarning } from "./secondary-modals/UnlinkTicketWarning"
import { DeleteTicketWarning } from "./secondary-modals/DeleteTicketWarning" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SECONDARY_MODAL_Z_INDEX } from "../helpers/constants"

export const secondaryModalTypes = {
	"SHOW_DELETE_COMMENT_WARNING": DeleteCommentWarning,
	"SHOW_UNLINK_TICKET_WARNING": UnlinkTicketWarning,
	"DELETE_TICKET_WARNING": DeleteTicketWarning
}

export const SecondaryModal = () => {
	const dispatch = useAppDispatch()
	const { currentSecondaryModalType, showSecondaryModal, currentSecondaryModalProps }  = useAppSelector((state) => state.secondaryModal)
	const ModalContent = secondaryModalTypes[currentSecondaryModalType as keyof typeof secondaryModalTypes] as React.FC

	return (
		<div className = {`${SECONDARY_MODAL_Z_INDEX} !tw-bg-black/50 overlay ${showSecondaryModal ? "--visible" : "--hidden"}`}>
			<div className = {"tw-top-[30%] modal-container"}>
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
				<div className = "modal">
					<div className = "modal-content">
						{
							ModalContent ? <ModalContent {...currentSecondaryModalProps} /> : null
						}
					</div>
				</div>
			</div>	
		</div>
	)	
}