import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import type { Status, Ticket, TicketType, Priority } from "../types/common"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../services/private/board"
import { useAddTicketMutation, useDeleteTicketMutation, useUpdateTicketMutation } from "../services/private/ticket"
import { addToast } from "../slices/toastSlice" 

type FormValues = {
	id?: number
	name: string
	description: string
	priorityId: number
	statusId: number
	ticketTypeId: number
}

export const TicketForm = () => {
	const dispatch = useAppDispatch()
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { tickets } = useAppSelector((state) => state.ticket) 
	const { 
		currentTicketId, 
		board, 
		boardInfo, 
		statusesToDisplay, 
		tickets: boardTickets 
	} = useAppSelector((state) => state.board)
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const [ addTicket, {isLoading: isAddTicketLoading, error: isAddTicketError} ] = useAddTicketMutation() 
	const [ updateTicket, {isLoading: isUpdateTicketLoading, error: isUpdateTicketError} ] = useUpdateTicketMutation() 
	const [ deleteTicket, {isLoading: isDeleteTicketLoading, error: isDeleteTicketError} ] = useDeleteTicketMutation()
	const [ addBoardTickets, {isLoading: isAddBoardTicketsLoading, error: isAddBoardTicketsError} ] = useAddBoardTicketsMutation() 
	const [ deleteBoardTicket, {isLoading: isDeleteBoardTicketLoading, error: isDeleteBoardTicketError}] = useDeleteBoardTicketMutation()
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		description: "",
		priorityId: 1,
		statusId: 1,
		ticketTypeId: 1
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset , formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
	    name: { required: "Name is required" },
	    description: { required: "Password is required"},
	    priorityId: { required: "Priority is required"},
	    statusId: { required: "Status is required"},
	    ticketTypeId: { required: "Ticket Type is required"},
    }
	useEffect(() => {
		// initialize with current values if the ticket exists
		if (currentTicketId){
			const ticket = tickets.find((t: Ticket) => t.id === currentTicketId)
			reset(ticket ?? defaultForm)
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, currentTicketId])

    const onSubmit = async (values: FormValues) => {
    	try {
    		// update existing ticket
    		if (values.id != null){
    			await updateTicket({...values, id: values.id}).unwrap()
    		}
    		// add new ticket
    		else {
		    	const data = await addTicket(values).unwrap()
		    	if (boardInfo){
			    	await addBoardTickets({boardId: boardInfo.id, ticketIds: [data.id]}).unwrap()
		    	}
    		}
			dispatch(toggleShowModal(false))
			dispatch(selectCurrentTicketId(null))
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket ${values.id != null ? "updated" : "added"} successfully!`,
    		}))
    	}
    	catch (e) { 
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: "Failed to submit ticket",
    		}))
    	}
    }

    const onDelete = async () => {
    	if (currentTicketId && boardInfo?.id){
	    	try {
		    	await deleteBoardTicket({boardId: boardInfo.id, ticketId: currentTicketId}).unwrap()
		    	await deleteTicket(currentTicketId).unwrap()
				dispatch(toggleShowModal(false))
				dispatch(selectCurrentTicketId(null))
	    		dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: "Ticket deleted successfully!",
	    		}))
	    	}
	    	catch (e) {
	    		dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: "Failed to delete ticket",
	    		}))
	    	}
    	}
    }

	return (
		<div className = "container">
			<form>
				<div className = "form-row">
					<div className = "form-cell">
						<label>Name</label>
						<input type = "text"
						{...register("name", registerOptions.name)}
						/>
					</div>
					<div className = "form-cell">
						<label>Status</label>
						<select {...register("statusId", registerOptions.statusId)}>
							{statusesToDisplay.map((status: Status) => {
								return <option key = {status.id} value = {status.id}>{status.name}</option>
							})}
						</select>	
					</div>
					<div className = "form-cell">
						<label>Description</label>
						<textarea {...register("description", registerOptions.description)}></textarea>
					</div>
						<div className = "form-cell">
						<label>Priority</label>
						<select {...register("priorityId", registerOptions.priorityId)}>
							<option disabled value = "">---</option>
							{priorities.map((priority: Priority) => {
								return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
							})}
						</select>
					</div>
					<div className = "form-cell">
						<label>Ticket Type</label>
						<select {...register("ticketTypeId", registerOptions.ticketTypeId)}>
							<option disabled value = "">---</option>
							{ticketTypes.map((ticketType: TicketType) => {
								return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
							})}
						</select>
					</div>
				</div>
				<div className = "form-row">
					<div className = "btn-group">
						<button onClick={handleSubmit(onSubmit)} className = "btn">Submit</button>
					</div>
					{
						currentTicketId && boardInfo?.id ? (
							<div className = "btn-group">
								<button onClick={
									(e) => {
										e.preventDefault()
										onDelete()
									}
								} className = "btn --alert">Delete</button>
							</div>
						) : null
					}
				</div>
			</form>
		</div>
	)	
}
