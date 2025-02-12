import React, { useState } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { KanbanBoard, GroupedTickets, GroupByOptionsKey, Status, GroupByElement, Ticket as TicketType } from "../../types/common"
import { useGetGroupByElementsQuery } from "../../services/private/groupBy"
import { useUpdateTicketStatusMutation } from "../../services/private/ticket"
import { 
	selectCurrentTicketId,
} from "../../slices/boardSlice"
import {
	toggleShowModal, 
	setModalType, 
	setModalProps, 
} from '../../slices/modalSlice'
import { Ticket } from "../Ticket"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { sortStatusByOrder } from "../../helpers/functions"
import { StatusHeader } from "./StatusHeader"

type Props = {
	tickets: Array<TicketType>
	dragStart: (e: React.DragEvent<HTMLDivElement>) => void
	enableDropping: (e: React.DragEvent<HTMLDivElement>) => void  
	board: KanbanBoard
	statusesToDisplay: Array<Status>
	allStatuses: Array<Status>
	boardStyle: Record<string, string>
	colWidth: Record<string, string>
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
}

export const Board = ({
	allStatuses, 
	board, 
	dragStart,
	enableDropping,
	boardStyle, 
	tickets,
	statusesToDisplay,
	colWidth,
	addTicketHandler,
	hideStatusHandler,
}: Props) => {

	const dispatch = useAppDispatch()
	const [updateTicketStatus] = useUpdateTicketStatusMutation() 

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
						<StatusHeader 
							statusId={status.id} 
							numTickets={board[status.id]?.length} 
							statusName={allStatuses.find((s: Status) => s.id === status.id)?.name ?? ""} 
							addTicketHandler={addTicketHandler} 
							hideStatusHandler={hideStatusHandler}
						/>
						<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-px-2 tw-pb-2">
							{board[status.id]?.map((ticketId: number) => {
								const ticket = tickets.find((t: TicketType) => t.id === ticketId)
								return (
									<div 
										key = {ticketId} 
										id = {`ticket_${ticketId}`}
										/* 
										For semantic HTML purposes, move the ticket component into a button, and then move the 
										onClick handler into the button. It does mess up the styling of the card within the column
										so need to fix that too
										*/
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
	)
}

