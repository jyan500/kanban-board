import React from "react"
import { useAppDispatch } from "../hooks/redux-hooks" 
import { SearchBar } from "./SearchBar" 
import "../styles/toolbar.css"
import { toggleShowModal, setModalType, sortByPriority, deleteAllTickets } from "../slices/boardSlice" 

export const ToolBar = () => {
	const dispatch = useAppDispatch()
	return (
		<div className = "toolbar">
			<SearchBar/>
			<div className = "btn-group">
				<button onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("TICKET_FORM"))
				}}>Add Ticket</button>
				<button onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("STATUS_FORM"))
				}}>Edit Statuses</button>
				<button className = "" onClick = {() => dispatch(sortByPriority({sortOrder: 1}))}>Sort By Priority</button>
				<button className = "--alert" onClick = {() => dispatch(deleteAllTickets())}>Delete All Tickets</button>
			</div>
		</div>
	)
}