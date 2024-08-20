import React, { useEffect } from "react"
import { addToast } from "../slices/toastSlice"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { useDeleteTicketMutation } from "../services/private/ticket" 
import { toggleShowModal, setModalType } from "../slices/modalSlice"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { IconContext } from "react-icons"
import { v4 as uuidv4 } from "uuid"

export const DeleteTicketWarning = () => {
	const {
		currentTicketId,
	} = useAppSelector((state) => state.board)
	const { showModal } = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()
	const [deleteTicket, {isLoading: isDeleteTicketLoading, error: isDeleteTicketError}] = useDeleteTicketMutation()

	const onDelete = async () => {
		try {
			if (currentTicketId){
				await deleteTicket(currentTicketId).unwrap()
				dispatch(selectCurrentTicketId(null))
				dispatch(toggleShowModal(false))
				dispatch(addToast({
					id: uuidv4(),
					type: "success",	
					animationType: "animation-in",
					message: "Ticket deleted successfully!"
				}))
			}
			else {
				dispatch(addToast({
					id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: "Failed to submit ticket",
				}))
			}
		}
		catch (e){
			dispatch(addToast({
				id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: "Failed to submit ticket",
			}))
		}
	}

	const onCancel = () => {
		dispatch(toggleShowModal(false))
		dispatch(selectCurrentTicketId(null))
	}

	return (
		<div>
			<div className = "icon-container">
				<IconContext.Provider value={{color: "var(--bs-danger)"}}>
					<WarningIcon className = "--l-icon"/>
				</IconContext.Provider>
				<strong>Delete Ticket</strong>
			</div>
			<div className = "tw-py-4">
				<strong>You're about to permanently delete this issue, its comments, and all of its data.</strong>
				<p>If you're not sure, you can resolve or close this issue instead.</p>
			</div>
			<div className = "btn-group">
				<button className = "--alert" onClick={() => onDelete()}>Delete</button>
				<button className = "--secondary" onClick={() => onCancel()}>Cancel</button>
			</div>
		</div>
	)
}