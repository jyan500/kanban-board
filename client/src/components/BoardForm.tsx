import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { useAddBoardMutation, useUpdateBoardMutation, useBulkEditBoardStatusesMutation } from "../services/private/board" 
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../slices/toastSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { Status } from "../types/common"

type FormValues = {
	id?: number
	name: string
}

export const BoardForm = () => {
	const dispatch = useAppDispatch()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const { statuses } = useAppSelector((state) => state.status)
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
	}
	const [ addBoard ] = useAddBoardMutation() 
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const [formStatuses, setFormStatuses] = useState<Array<Status>>([])
	const [ bulkEditBoardStatuses, {isLoading: isLoading, error: isError} ] =  useBulkEditBoardStatusesMutation() 
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
	    name: { required: "Name is required" },
    }
	// useEffect(() => {
	// 	// initialize with current values if the board exists
	// 	if (currentTicketId){
	// 		let ticket = tickets.find((t: Ticket) => t.id === currentTicketId)
	// 		let ticketWithAssignee = {...ticket, userId: ticketAssignees?.length ? ticketAssignees[0].id : 0}
	// 		reset(ticketWithAssignee)
	// 	}
	// 	else {
	// 		reset(defaultForm)
	// 	}
	// }, [showModal, currentTicketId])

    const onSubmit = async (values: FormValues) => {
    	try {
    		if (values.id != null){

    		}	
    		else {
    			const data = await addBoard(values).unwrap()
    		}
    		dispatch(toggleShowModal(false))
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Board ${values.id != null ? "updated" : "added"} successfully!`,
    		}))
    	}
    	catch {
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to ${values.id != null ? "update" : "add"} board.`,
    		}))
    	}
    }

    const onCheck = (id: number) => {
		const formStatus = formStatuses.find((status) => status.id === id)
		// if index could not be found in the display statuses, add to the form statuses, otherwise remove
		if (!formStatus){
			const status = statuses.find((status) => status.id === id)
			if (status){
				setFormStatuses([...formStatuses, status])
			}
		}
		else {
			setFormStatuses(formStatuses.filter((s)=>formStatus.id !== s.id))	
		}
	}

    const onDelete = async () => {
    	// if (currentTicketId && boardInfo?.id){
	    // 	try {
		//     	await deleteBoardTicket({boardId: boardInfo.id, ticketId: currentTicketId}).unwrap()
		//     	await deleteTicket(currentTicketId).unwrap()
		// 		dispatch(toggleShowModal(false))
		// 		dispatch(selectCurrentTicketId(null))
	    // 		dispatch(addToast({
	    // 			id: uuidv4(),
	    // 			type: "success",
	    // 			animationType: "animation-in",
	    // 			message: "Ticket deleted successfully!",
	    // 		}))
	    // 	}
	    // 	catch (e) {
	    // 		dispatch(addToast({
	    // 			id: uuidv4(),
	    // 			type: "failure",
	    // 			animationType: "animation-in",
	    // 			message: "Failed to delete ticket",
	    // 		}))
	    // 	}
    	// }
    }

	return (
		<div className = "container">
			<form>
				<div className = "form-row">
					<div className = "form-cell">
						<label htmlFor = "board-name">Name</label>
						<input id = "board-name" type = "text"
						{...register("name", registerOptions.name)}
						/>
				        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
					</div>
				</div>
				{ statuses.map((status) => (
					<div key = {status.id} className="form-row">
						<div className = "form-cell">
							<input id = {`board-status-${status.id}`} checked = {formStatuses.find((s)=>s.id === status.id) != null} onChange={(e) => onCheck(status.id)} type = "checkbox"/>
						</div>
						<div className = "form-cell">
							<label htmlFor = {`board-status-${status.id}`}>{status.name}</label>
						</div>
					</div>
				))}
				<div className = "form-row">
					<div className = "btn-group">
						<button onClick={handleSubmit(onSubmit)} className = "btn">Submit</button>
					</div>
				</div>
			</form>
		</div>
	)	
}
