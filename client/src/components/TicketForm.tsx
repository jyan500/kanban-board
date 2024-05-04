import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { addTicketToBoard, selectCurrentTicketId, editTicket, toggleShowModal } from "../slices/boardSlice"
import { v4 as uuidv4 } from "uuid" 
import type { Status, Ticket, Priority } from "../types/common"

export const TicketForm = () => {
	return (
		<div></div>
	)
	// const dispatch = useAppDispatch()
	// const board = useAppSelector((state) => state.board)
	// let defaultForm = {
	// 	id: "",
	// 	name: "",
	// 	description: "",
	// 	priority: "",
	// 	// default TODO
	// 	status: "1"
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
