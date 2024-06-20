import React from "react"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { 
	selectCurrentTicketId,
	setBoard,
} from "../slices/boardSlice"
import {
	toggleShowModal, 
	setModalType, 
	setModalProps, 
} from '../slices/modalSlice'
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
	KanbanBoard as KanbanBoardType,
	Priority
} from "../types/common"
import { prioritySort as sortByPriority, sortStatusByOrder } from "../helpers/functions" 
import { IoIosArrowDown as ArrowDown, IoIosArrowUp as ArrowUp } from "react-icons/io";

export const Board = () => {
	const {board, statusesToDisplay} = useAppSelector((state) => state.board)
	const { statuses: allStatuses } = useAppSelector((state) => state.status)
	const { tickets } = useAppSelector((state) => state.ticket)
	const { priorities } = useAppSelector((state) => state.priority)
	const dispatch = useAppDispatch()
	const boardStyle = {
		"display": "grid",	
		"gridTemplateColumns": `repeat(${statusesToDisplay.length}, minmax(200px, 1fr))`,
		"gridGap": "8px",
		"width": "100%"
	}
	const prioritySort = (sortOrder: 1 | -1, statusId: number | undefined) => {
		let sortedBoard = sortByPriority(
			board,		
			tickets,
			priorities,
			sortOrder,
			statusId,
		)
		dispatch(setBoard(sortedBoard))
	}
	return (
		<div className = "board-container">
			<ToolBar/>
			<div style = {boardStyle}>
				{statusesToDisplay.map((status: Status) => {
					return (<div key = {status.id} className = "grid-col">
						<div>
							<div className = "grid-col-header">
								{/*<button className = "--transparent" onClick={() => prioritySort(1, status.id)}><ArrowUp className = "icon"/></button>*/}
								<p className = "__title">
									{allStatuses.find((s: Status) => s.id === status.id)?.name}
									<span className = "__field">
										{board[status.id].length}
									</span>
								</p>
								{/*<button className = "--transparent" onClick={() => prioritySort(-1, status.id)}><ArrowDown className = "icon"/></button>*/}
							</div>
							{board[status.id]?.map((ticketId: number) => {
								const ticket = tickets.find((t: TicketType) => t.id === ticketId)
								return (
									<div 
										key = {ticketId} 
										onClick = {() => {
											dispatch(toggleShowModal(true))
											dispatch(setModalType("TICKET_FORM"))
											dispatch(selectCurrentTicketId(ticketId))
										}}
										className = "cell">
										{ticket ? <Ticket 
											ticket = {ticket}
										/> : null}
									</div>
								)
							})}
						</div>
					</div>)
				})}
			</div>
			<Modal/>
		</div>
	)	
}