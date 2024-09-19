import React from "react"
import { useDeleteTicketCommentMutation } from "../../services/private/ticket"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { Toast } from "../../types/common"
import { Warning } from "./Warning"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"

export interface DeleteCommentWarningProps {
	commentId: number
}

export const DeleteCommentWarning = ({commentId}: DeleteCommentWarningProps) => {
	const {
		currentTicketId,
	} = useAppSelector((state) => state.board)
	const dispatch = useAppDispatch()
	const [ deleteTicketComment, {isLoading: isDeleteTicketCommentLoading, error: isDeleteTicketCommentError }] = useDeleteTicketCommentMutation()

	const closeSecondaryModal = () =>{
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}

	const onSubmit = async () => {
		const defaultToast:Toast = {
			id: uuidv4(),
			message: "Something went wrong while deleting comment",
			type: "failure",
			animationType: "animation-in"
		}
		if (currentTicketId && commentId){
			try {
				await deleteTicketComment({commentId, ticketId: currentTicketId}).unwrap()
				closeSecondaryModal()
				dispatch(addToast({
					...defaultToast, 
					message: "Comment deleted successfully!",
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
				title={"Delete Comment"}
				onSubmit={onSubmit}
				onCancel={onCancel}
				isLoading={isDeleteTicketCommentLoading}
				submitText={"Delete"}
				cancelText={"Cancel"}
			>
				<div className = "tw-py-4">
					<strong>Are you sure you want to delete this comment?</strong>
				</div>
			</Warning>
		</div>
	)	
}