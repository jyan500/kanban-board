import React from "react"
import { useDeleteTicketActivityMutation } from "../../services/private/ticket"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { Toast } from "../../types/common"
import { Warning } from "./Warning"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"

export interface DeleteTicketActivityWarningProps {
	ticketId: number | undefined
	activityId: number | undefined
}

export const DeleteTicketActivityWarning = ({ticketId, activityId}: DeleteTicketActivityWarningProps) => {
	const dispatch = useAppDispatch()
	const [ deleteTicketActivity, {isLoading: isDeleteTicketActivityLoading, error: isDeleteTicketActivityError }] = useDeleteTicketActivityMutation()

	const closeSecondaryModal = () =>{
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}

	const onSubmit = async () => {
		const defaultToast:Toast = {
			id: uuidv4(),
			message: "Something went wrong while deleting activity",
			type: "failure",
			animationType: "animation-in"
		}
		if (ticketId && activityId){
			try {
				await deleteTicketActivity({activityId, ticketId}).unwrap()
				closeSecondaryModal()
				dispatch(addToast({
					...defaultToast, 
					message: "activity deleted successfully!",
					type: "success",
				}))
			}
			catch (e){
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

	return (
		<div>
			<Warning
				title={"Delete Ticket Activity"}
				onSubmit={onSubmit}
				onCancel={onCancel}
				isLoading={isDeleteTicketActivityLoading}
				submitText={"Delete"}
				cancelText={"Cancel"}
			>
				<div className = "tw-py-4">
					<strong>Are you sure you want to delete this ticket Activity?</strong>
				</div>
			</Warning>
		</div>
	)	
}