import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { addTicketToBoard, selectCurrentTicketId, editTicket, toggleShowModal } from "../slices/boardSlice"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import type { Status, Ticket, TicketType, Priority } from "../types/common"
import { useAddBoardTicketsMutation } from "../services/private/board"
import { useAddTicketMutation } from "../services/private/ticket"

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
	const { 
		showModal, 
		currentTicketId, 
		board, 
		boardInfo, 
		statusesToDisplay, 
		tickets 
	} = useAppSelector((state) => state.board)
	const [ addTicket, {isLoading: isAddTicketLoading, error: isAddTicketError} ] = useAddTicketMutation() 
	const [ addBoardTickets, {isLoading: isAddBoardTicketsLoading, error: isAddBoardTicketsError} ] = useAddBoardTicketsMutation() 
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
    		if (values.id){
    			console.log("update existing ticket")
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
    	}
    	catch (e) { 

    	}
    }

	return (
		<div className = "container">
			<form onSubmit = {handleSubmit(onSubmit)}>
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
						<label>Ticket Type</label>
						<select {...register("ticketTypeId", registerOptions.ticketTypeId)}>
							<option disabled value = "">---</option>
							{priorities.map((priority: Priority) => {
								return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
							})}
						</select>
					</div>
					<div className = "form-cell">
						<label>Priority</label>
						<select {...register("priorityId", registerOptions.priorityId)}>
							<option disabled value = "">---</option>
							{ticketTypes.map((ticketType: TicketType) => {
								return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
							})}
						</select>
					</div>
				</div>
				<div className = "form-row">
					<div className = "btn-group">
						<input type = "submit" className = "btn"/>
					</div>
				</div>
			</form>
		</div>
	)	
	// const dispatch = useAppDispatch()
	// const board = useAppSelector((state) => state.board)
	// let defaultForm = {
	// 	id: "",
	// 	name: "",
	// 	description: "",
	// 	priorityId: 1,
	// 	statusId: 1, 
	// 	ticketTypeId: 1
	// }

	// const [form, setForm] = useState(defaultForm)

	// useEffect(() => {
	// 	// initialize with current values if the ticket exists
	// 	if (board.currentTicketId){
	// 		const ticket = board.tickets.find((ticket: Ticket) => ticket.id === board.currentTicketId)
	// 		setForm(ticket ? {
	// 			...ticket,
	// 			priority: ticket.priority.id,
	// 			status: ticket.status.id
	// 		} : defaultForm)
	// 	}
	// 	else {
	// 		setForm(defaultForm)	
	// 	}
	// }, [board.showModal, board.currentTicketId])

	// const onSubmit = () => {
	// 	const status = board.statuses.find((status: Status) => status.id === form.status)
	// 	const priority = board.priorityList.find((priority: Priority) => priority.id === form.priority)
	// 	if (priority && status){
	// 		if (form.id === ""){
	// 			dispatch(addTicketToBoard({
	// 				...form,
	// 				id: uuidv4(),
	// 				priority: priority,
	// 				status: status
	// 			}))
	// 		}
	// 		else {
	// 			dispatch(editTicket({...form, priority: priority, status: status}))	
	// 		}
	// 		dispatch(toggleShowModal(false))
	// 		dispatch(selectCurrentTicketId(null))
	// 		setForm(defaultForm)
	// 	}
	// }
	// return (
	// 	<div className = "container">
	// 		<form onSubmit = {(e) => {
	// 			e.preventDefault()
	// 			onSubmit()
	// 		}}>
	// 			<div className = "form-row">
	// 				<div className = "form-cell">
	// 					<label>Name</label>
	// 					<input onChange = {(e) => setForm({...form, name: e.target.value})} value = {form.name} type = "text"/>
	// 				</div>
	// 				<div className = "form-cell">
	// 					<label>Status</label>
	// 					<select value = {form.status} onChange = {(e) => setForm({...form, status: e.target.value})}>
	// 						{board.statuses.filter((status: Status) => board.statusesToDisplay.includes(status.id)).map((status: Status) => {
	// 							return <option key = {status.id} value = {status.id}>{status.name}</option>
	// 						})}
	// 					</select>	
	// 				</div>
	// 				<div className = "form-cell">
	// 					<label>Description</label>
	// 					<textarea onChange = {(e) => setForm({...form, description: e.target.value})}  value = {form.description} ></textarea>
	// 				</div>
	// 				<div className = "form-cell">
	// 					<label>Priority</label>
	// 					<select value = {form.priority} onChange = {(e) => setForm({...form, priority: e.target.value})}>
	// 						<option disabled value = "">---</option>
	// 						{board.priorityList.map((priority: Priority) => {
	// 							return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
	// 						})}
	// 					</select>
	// 				</div>
	// 			</div>
	// 			<div className = "form-row">
	// 				<div className = "btn-group">
	// 					<input type = "submit" className = "btn"/>
	// 				</div>
	// 			</div>
	// 		</form>
	// 	</div>
	// )	
}
