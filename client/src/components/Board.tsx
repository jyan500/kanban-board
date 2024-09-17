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
import { useUpdateTicketStatusMutation } from "../services/private/ticket" 
import { addToast } from "../slices/toastSlice"

export const Board = () => {
	const {board, filteredTickets, tickets, statusesToDisplay} = useAppSelector((state) => state.board)
	const { statuses: allStatuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const [updateTicketStatus] = useUpdateTicketStatusMutation() 
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

	const dragStart = (e: React.DragEvent<HTMLDivElement>) => {
		e.dataTransfer.setData("text", e.currentTarget.id)
	}

	const enableDropping = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		const ticketId = parseInt(e.dataTransfer.getData("text").replace("ticket_", ""))
		const statusId = parseInt(e.currentTarget.id.replace("status_", ""))
		const ticket = board[statusId].find((tId) => tId === ticketId)
		// if the status column does not contain the ticket, move the ticket into this column
		if (!ticket){
			// new endpoint to PATCH update ticket status
			try {
				await updateTicketStatus({ticketId: ticketId, statusId: statusId}).unwrap()
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: `Ticket status updated successfully!`,
	    		}))
			}
			catch (e){
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: `Failed to update ticket status.`,
	    		}))
			}
		}
	}

	return (
		<div className = "tw-flex tw-flex-col">
			<ToolBar/>
			<div style = {boardStyle}>
				{statusesToDisplay.map((status: Status) => {
					return (
					<div 
						id = {`status_${status.id}`} 
						key = {status.id} 
						onDrop={handleDrop} 
						onDragOver={enableDropping} 
						className = "tw-flex tw-flex-col tw-bg-gray-50 tw-min-h-[600px]"
					>
						<div>
							<div className = "tw-ml-2 tw-py-2 tw-flex tw-flex-row tw-items-center tw-gap-x-2">
								{/*<button className = "--transparent" onClick={() => prioritySort(1, status.id)}><ArrowUp className = "icon"/></button>*/}
								<p className = "tw-font-bold">
									{allStatuses.find((s: Status) => s.id === status.id)?.name}
								</p>
								<span>
									{board[status.id]?.length}
								</span>
								{/*<button className = "--transparent" onClick={() => prioritySort(-1, status.id)}><ArrowDown className = "icon"/></button>*/}
							</div>
							<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-p-2">
								{board[status.id]?.map((ticketId: number) => {
									const ticket = filteredTickets.find((t: TicketType) => t.id === ticketId)
									return (
										<div 
											key = {ticketId} 
											id = {`ticket_${ticketId}`}
											onClick = {() => {
												dispatch(toggleShowModal(true))
												dispatch(setModalType("EDIT_TICKET_FORM"))
												dispatch(selectCurrentTicketId(ticketId))
											}}
											draggable
											onDragStart={dragStart}
											>
											{ticket ? <Ticket 
												ticket = {ticket}
											/> : null}
										</div>
									)
								})}
							</div>
						</div>
					</div>)
				})}
			</div>
		</div>
	)	
}