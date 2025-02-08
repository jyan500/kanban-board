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
import { ToolBar } from "./boards/ToolBar" 
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
import { useUpdateTicketStatusMutation } from "../services/private/ticket" 
import { addToast } from "../slices/toastSlice"
import { boardGroupBy } from "../helpers/groupBy"
import { GroupedBoard } from "./boards/GroupedBoard"
import { Board as DefaultBoard } from "./boards/Board"
import { useScreenSize } from "../hooks/useScreenSize"
import { LG_BREAKPOINT, XL_BREAKPOINT, MD_BREAKPOINT } from "../helpers/constants"

export const Board = () => {
	const {board, filteredTickets, tickets, statusesToDisplay, groupBy} = useAppSelector((state) => state.board)
	const { statuses: allStatuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const [updateTicketStatus] = useUpdateTicketStatusMutation() 
	const dispatch = useAppDispatch()
	const {width, height} = useScreenSize()
	const boardStyle = {
		"maxWidth": `${width}px`,
		"overflowX": "scroll",
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
		/* 
			Because of the side scroll that appears on smaller screens, 
			disabling ticket dragging and movement for smaller screens
		*/
		if (width >= LG_BREAKPOINT){
			e.preventDefault()
		}
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
			{
				groupBy !== "NONE" ? (
					/* Dragging tickets is disabled on mobile */
					<GroupedBoard
						groupedTickets={boardGroupBy(groupBy, tickets, statusesToDisplay)}
						board={board}
						boardStyle={boardStyle}
						groupBy={groupBy}
						dragStart={dragStart}
						enableDropping={enableDropping}
						tickets={filteredTickets}
						statusesToDisplay={statusesToDisplay}
						allStatuses={allStatuses}
					/>
				) : (
					/* Dragging tickets is disabled on mobile */
					<DefaultBoard
						enableDropping={enableDropping}
						board={board}
						boardStyle={boardStyle}
						dragStart={dragStart}
						tickets={filteredTickets}
						statusesToDisplay={statusesToDisplay}
						allStatuses={allStatuses}
						colWidth={{"maxWidth": `${width/statusesToDisplay.length}px`}}
					/>		
				)
			}
		</div>
	)	
}
