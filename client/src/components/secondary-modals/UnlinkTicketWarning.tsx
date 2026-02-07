import React from "react"
import { useDeleteTicketRelationshipMutation } from "../../services/private/ticket"
import { useAppDispatch } from "../../hooks/redux-hooks"
import { Warning } from "./Warning" 
import { v4 as uuidv4 } from "uuid"
import { Toast } from "../../types/common"
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

export interface UnlinkTicketWarningProps {
	ticketId: number | undefined
	ticketRelationshipId: number | undefined
}
export const UnlinkTicketWarning = ({ticketId, ticketRelationshipId}: UnlinkTicketWarningProps ) => {
	const [ deleteTicketRelationship, { error: deleteTicketRelationshipError, isLoading: isDeleteTicketRelationshipLoading }] = useDeleteTicketRelationshipMutation()
	const dispatch = useAppDispatch()
	const onSubmit = async () => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while unlinking ticket.",
			animationType: "animation-in",
			type: "failure"
    	}
    	if (ticketId && ticketRelationshipId){
	    	try {
		    	await deleteTicketRelationship({ticketId, ticketRelationshipId}).unwrap()
				closeSecondaryModal()
		    	dispatch(addToast({
		    		...defaultToast,
		    		message: "Ticket unlinked successfully!",
		    		type: "success"
		    	}))
	    	}
	    	catch (e) {
	    		dispatch(addToast(defaultToast))
	    	}
    	}
    	else {
    		dispatch(addToast(defaultToast))
    	}
	}

	const onCancel = () => {
		closeSecondaryModal()
	}

	const closeSecondaryModal = () => {
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}


	return (
		<div>
			<Warning
				title={"Unlink Ticket"}
				onSubmit={onSubmit}
				onCancel={onCancel}
				isLoading={isDeleteTicketRelationshipLoading}
				submitText={"Unlink"}
				cancelText={"Cancel"}
			>
				<div className = "tw-py-4">
					<p className={`${PRIMARY_TEXT} tw-font-semibold`}>Are you sure you want to unlink this ticket?</p>
					<p className={SECONDARY_TEXT}>This will not delete the ticket, it will only unlink the ticket from it's parent or child ticket.</p>
				</div>
			</Warning>
		</div>
	)	
}