import React from "react"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { 
	deleteAllTickets, 
	toggleShowModal, 
	setModalType, 
	setModalProps, 
	sortByPriority, 
	selectCurrentTicketId 
} from "../slices/boardSlice"
import { Ticket } from "./Ticket"
import "../styles/common.css" 
import "../styles/board.css"
import { v4 as uuidv4 } from "uuid" 
import { Modal } from "./Modal" 
import type { Cell as CellType, Status, Ticket as TicketType } from "../types/common"
import { sortStatusByOrder } from "../helpers/functions" 
import { IoIosArrowDown as ArrowDown, IoIosArrowUp as ArrowUp } from "react-icons/io";

export const Board = () => {
	const board = useAppSelector((state) => state.board)
	const dispatch = useAppDispatch()
	const boardStyle = {
		"display": "grid",	
		"gridTemplateColumns": `repeat(${board.statusesToDisplay.length}, minmax(200px, 1fr))`,
		"gridGap": "8px",
		"width": "100%"
}
	return (
		<div className = "board-container">
			<div className = "btn-row">
				<button onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("TICKET_FORM"))
				}} className = "btn">Add Ticket</button>
				<button onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("STATUS_FORM"))
				}} className = "btn">Edit Statuses</button>
				<button onClick = {() => dispatch(sortByPriority({sortOrder: 1}))} className = "btn">Sort By Priority</button>
				<button onClick = {() => dispatch(deleteAllTickets())} className = "btn alert">Delete All Tickets</button>
			</div>
			<div style = {boardStyle}>
				{[...board.statuses].sort(sortStatusByOrder).map((status: Status) => {
					if (board.statusesToDisplay.includes(status.id)){
						return (<div key = {status.id} className = "grid-col">
							<div>
								<div className = "grid-col-header">
									<button onClick={() => dispatch(sortByPriority({sortOrder: 1, statusId: status.id}))}><ArrowUp/></button>
									<p>{board.statuses.find((s: Status) => s.id === status.id)?.name}</p>
									<button onClick={() => dispatch(sortByPriority({sortOrder: 0, statusId: status.id}))}><ArrowDown/></button>
								</div>
								{board.newBoard[status.id].map((ticket: TicketType) => {
									return (
										<div 
											key = {ticket.id} 
											onClick = {() => {
												dispatch(toggleShowModal(true))
												dispatch(setModalType("TICKET_FORM"))
												dispatch(selectCurrentTicketId(ticket.id))
											}}
											className = "cell">
											<Ticket 
												ticket = {ticket}
											/>
										</div>
									)
								})}
							</div>
						</div>)
					}
				})}
			</div>
			<Modal/>
		</div>
	)	
}