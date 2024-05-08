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
import "../styles/board.css"
import { ToolBar } from "./ToolBar" 
import { v4 as uuidv4 } from "uuid" 
import { Modal } from "./Modal" 
import type { 
	Cell as CellType, 
	Status, 
	Ticket as TicketType, 
	Board as BoardType, 
	KanbanBoard as KanbanBoardType 
} from "../types/common"
import { sortStatusByOrder } from "../helpers/functions" 
import { IoIosArrowDown as ArrowDown, IoIosArrowUp as ArrowUp } from "react-icons/io";

type Props = {
	board: KanbanBoardType
	statuses: Array<Status>
}

export const Board = ({board, statuses}: Props) => {
	// const board = useAppSelector((state) => state.board)
	const { statuses: allStatuses } = useAppSelector((state) => state.status)
	console.log(allStatuses)
	console.log(statuses)
	console.log(board)
	const dispatch = useAppDispatch()
	const boardStyle = {
		"display": "grid",	
		"gridTemplateColumns": `repeat(${statuses.length}, minmax(200px, 1fr))`,
		"gridGap": "8px",
		"width": "100%"
	}
	return (
		<div className = "board-container">
			<ToolBar/>
			<div style = {boardStyle}>
				{statuses.map((status: Status) => {
					if (allStatuses.filter((s) => s.id === status.id)){
						return (<div key = {status.id} className = "grid-col">
							<div>
								<div className = "grid-col-header">
									{/*
									<button className = "--transparent" onClick={() => dispatch(sortByPriority({sortOrder: 1, statusId: status.id}))}><ArrowUp className = "icon"/></button>
									<p>{board.statuses.find((s: Status) => s.id === status.id)?.name}</p>
									<button className = "--transparent" onClick={() => dispatch(sortByPriority({sortOrder: 0, statusId: status.id}))}><ArrowDown className = "icon"/></button>
									*/}
								</div>
								{board[status.id]?.map((ticket: TicketType) => {
									return (
										<div 
											key = {ticket.id} 
											onClick = {() => {
												// dispatch(toggleShowModal(true))
												// dispatch(setModalType("TICKET_FORM"))
												// dispatch(selectCurrentTicketId(ticket.id))
											}}
											className = "cell">
											{<Ticket 
												ticket = {ticket}
											/>}
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