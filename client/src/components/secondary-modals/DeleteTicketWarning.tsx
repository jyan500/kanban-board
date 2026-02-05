import React, { useEffect } from "react"
import { addToast } from "../../slices/toastSlice"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { useDeleteTicketMutation } from "../../services/private/ticket" 
import { toggleShowModal, setModalType } from "../../slices/modalSlice"
import { toggleShowSecondaryModal, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { Warning } from "./Warning"
import { IconContext } from "react-icons"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

interface Props {
	currentTicketId: number | null | undefined
}

export const DeleteTicketWarning = ({currentTicketId}: Props) => {
	const { showModal } = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()
	const [deleteTicket, {isLoading: isDeleteTicketLoading, error: isDeleteTicketError}] = useDeleteTicketMutation()

	const closeSecondaryModal = () => {
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalType(undefined))
	}

	const closePrimaryModal = () => {
		dispatch(selectCurrentTicketId(null))
		dispatch(toggleShowModal(false))
	}

	const onDelete = async () => {
		const defaultToast: Toast = {
			id: uuidv4(),
			type: "failure",
			animationType: "animation-in",
			message: "Failed to submit ticket",
		}
		try {
			if (currentTicketId){
				await deleteTicket(currentTicketId).unwrap()
				closePrimaryModal()	
				closeSecondaryModal()
				dispatch(addToast({
					...defaultToast,
					type: "success",	
					message: "Ticket deleted successfully!"
				}))
			}
			else {
				dispatch(addToast(defaultToast))
			}
		}
		catch (e){
			dispatch(addToast(defaultToast))
		}
	}

	const onCancel = () => {
		closeSecondaryModal()	
	}

	return (
		<div>
			<Warning onSubmit={onDelete} onCancel={onCancel} title={"Delete Ticket"} submitText={"Delete"} cancelText={"Cancel"}>
				<div className = "tw-py-4">
					<p className = {`${PRIMARY_TEXT} tw-font-bold`}>You're about to permanently delete this issue, its comments, and all of its data.</p>
					<p className = {`${SECONDARY_TEXT} tw-font-xs`}>If you're not sure, you can change the status of the issue instead.</p>
				</div>
			</Warning>
		</div>
	)
}