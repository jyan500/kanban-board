import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import "../styles/modal.css"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../slices/secondaryModalSlice" 
import { DeleteCommentWarning } from "./secondary-modals/DeleteCommentWarning"
import { DeleteTicketActivityWarning } from "./secondary-modals/DeleteTicketActivityWarning"
import { UnlinkTicketWarning } from "./secondary-modals/UnlinkTicketWarning"
import { DeleteTicketWarning } from "./secondary-modals/DeleteTicketWarning" 
import { AddToEpicFormModal } from "./secondary-modals/AddToEpicFormModal"
import { AddTicketFormModal } from "./primary-modals/AddTicketFormModal"
import { MoveTicketFormModal } from "./secondary-modals/MoveTicketFormModal"
import { SetColumnLimitModal } from "./secondary-modals/SetColumnLimitModal"
import { AddTicketWatchersModal } from "./secondary-modals/AddTicketWatchersModal"
import { TicketActivityModal } from "./secondary-modals/TicketActivityModal"
import { TicketAIFeaturesModal } from "./secondary-modals/TicketAIFeaturesModal"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SECONDARY_MODAL_Z_INDEX, LG_BREAKPOINT } from "../helpers/constants"
import { useScreenSize } from "../hooks/useScreenSize"

const avoidAsyncSelectMenuOverflow =  {"modal-container": "tw-top-[50%]", "modal": "!tw-overflow-visible tw-min-h-96"}

export const secondaryModalTypes = {
	"SHOW_DELETE_COMMENT_WARNING": DeleteCommentWarning,
	"SHOW_UNLINK_TICKET_WARNING": UnlinkTicketWarning,
	"DELETE_TICKET_WARNING": DeleteTicketWarning,
	"DELETE_TICKET_ACTIVITY_WARNING": DeleteTicketActivityWarning,
	"ADD_TO_EPIC_FORM_MODAL": AddToEpicFormModal,
	"MOVE_TICKET_FORM_MODAL": MoveTicketFormModal,
	"CLONE_TICKET_FORM_MODAL": AddTicketFormModal,
	"ADD_TICKET_WATCHERS_MODAL": AddTicketWatchersModal,
	"SET_COLUMN_LIMIT_MODAL": SetColumnLimitModal,
	"TICKET_ACTIVITY_MODAL": TicketActivityModal,
	"TICKET_AI_FEATURES_MODAL": TicketAIFeaturesModal,
}

export const secondaryModalClassNames = {
	"ADD_TO_EPIC_FORM_MODAL": avoidAsyncSelectMenuOverflow,
	"MOVE_TICKET_FORM_MODAL": avoidAsyncSelectMenuOverflow,
	"CLONE_TICKET_FORM_MODAL": avoidAsyncSelectMenuOverflow,
	"ADD_TICKET_WATCHERS_MODAL": avoidAsyncSelectMenuOverflow,
	"TICKET_ACTIVITY_MODAL": avoidAsyncSelectMenuOverflow,
}

export const SecondaryModal = () => {
	const dispatch = useAppDispatch()
	const { currentSecondaryModalType, showSecondaryModal, currentSecondaryModalProps }  = useAppSelector((state) => state.secondaryModal)
	const ModalContent = secondaryModalTypes[currentSecondaryModalType as keyof typeof secondaryModalTypes] as React.FC
	const modalContainerClassName = currentSecondaryModalType != null && currentSecondaryModalType in secondaryModalClassNames ? secondaryModalClassNames[currentSecondaryModalType as keyof typeof secondaryModalClassNames]["modal-container"] : ""
	const modalClassName = currentSecondaryModalType != null && currentSecondaryModalType in secondaryModalClassNames ? secondaryModalClassNames[currentSecondaryModalType as keyof typeof secondaryModalClassNames]["modal"] : ""
	const { width, height } = useScreenSize()
	const style = {
		width: `${width <= LG_BREAKPOINT ? width - 100 : LG_BREAKPOINT - 100 }px`
	}

	return (
		<div className = {`${SECONDARY_MODAL_Z_INDEX} !tw-bg-black/50 overlay ${showSecondaryModal ? "--visible" : "--hidden"}`}>
			<div style={style} className = {`${modalContainerClassName !== "" ? modalContainerClassName : "tw-top-[30%]"} modal-container`}>
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