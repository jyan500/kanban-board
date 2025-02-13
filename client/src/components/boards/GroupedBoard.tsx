/* 
Structure board by groups to prevent users from moving a ticket between groups
*/
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
import { IconButton } from "../page-elements/IconButton"
import { IconContext } from "react-icons"
import { IoIosArrowDown as ArrowDown, IoIosArrowUp as ArrowUp } from "react-icons/io";
import { LoadingSpinner } from "../LoadingSpinner"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { sortStatusByOrder } from "../../helpers/functions"
import { StatusHeader } from "./StatusHeader"

type Props = {
	groupedTickets: GroupedTickets
	tickets: Array<TicketType>
	dragStart: (e: React.DragEvent<HTMLDivElement>) => void
	enableDropping: (e: React.DragEvent<HTMLDivElement>) => void  
	board: KanbanBoard
	groupBy: GroupByOptionsKey 
	statusesToDisplay: Array<Status>
	allStatuses: Array<Status>
	boardStyle: Record<string, string>
	boardId: number
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
}

export const GroupedBoard = ({
	allStatuses, 
	board, 
	dragStart,
	enableDropping,
	boardStyle, 
	tickets,
	groupedTickets, 
	groupBy, 
	boardId,
	statusesToDisplay,
	addTicketHandler,
	hideStatusHandler,
}: Props) => {
	const dispatch = useAppDispatch()
	/* object mapping the group by ids to boolean to denote whether the collapse arrow for that section is on/off */
	const [collapseArrows, setCollapseArrows] = useState<Record<string, boolean>>(
		Object.keys(groupedTickets).reduce((acc: Record<string, boolean>, key: string) => {
		acc[key] = false
		return acc
	}, {}))
	const [updateTicketStatus] = useUpdateTicketStatusMutation() 
	const {data: groupByElements, isLoading, isError} = useGetGroupByElementsQuery({groupBy: groupBy, ids: Object.keys(groupedTickets)})  

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>, groupById: string) => {
		const ticketId = parseInt(e.dataTransfer.getData("text").replace(`group_by_${groupById}_ticket_`, ""))
		const statusId = parseInt(e.currentTarget.id.replace(`group_by_${groupById}_status_`, ""))
		const ticket = board[statusId].find((tId) => tId === ticketId)
		/* 
			if the status column does not contain the ticket, 
			move the ticket into this column. The !isNaN is to detect if the user
			drags the ticket from one swimlane into the other, where the ticket would not be found in that swimlane
			due to having a different group by Id
		*/
		if (!ticket && !isNaN(ticketId)){
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
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<div style={boardStyle}>
				{statusesToDisplay.map((status: Status) => {
					return (
						<div
						className = "tw-flex tw-flex-col tw-bg-gray-50"
						>
							<StatusHeader 
								status={status} 
								boardId={boardId}
								numTickets={board[status.id]?.length} 
								addTicketHandler={addTicketHandler}
								hideStatusHandler={hideStatusHandler}
							/>
						</div>
					)
				})}
			</div>
			{Object.keys(groupedTickets).map((groupById: string) => {
				const groupByElement = groupByElements?.find((element: GroupByElement) => element.id === parseInt(groupById))
				return (
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						<div style = {boardStyle}>
							<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-pl-2">
								<p className = "tw-font-bold">{groupByElement?.name}</p>
								<p>{`${Object.values(groupedTickets[groupById]).reduce((acc: number, arr: Array<number>) => 
									acc + arr.length, 0)} issues`}</p>
								<IconButton onClick={() => {
									setCollapseArrows({...collapseArrows, [groupById]: !collapseArrows[groupById]})	
								}}>
							    	{
							    		collapseArrows[groupById] ? 
										<ArrowUp className = "tw-h-4 tw-w-4"/>
										: <ArrowDown className = "tw-h-4 tw-w-4"/>
							    	}
								</IconButton>
							</div>
						</div>
						{!collapseArrows[groupById] ? (
							<div style = {boardStyle}>
							{
								statusesToDisplay.map((status) => {
									return (
										<div 
											className = "tw-flex tw-flex-col tw-bg-gray-50 tw-min-h-[400px] tw-pt-2"
											id = {`group_by_${groupById}_status_${status.id}`} 
											key = {`group_by_${groupById}_status_${status.id}`} 
											onDrop={(e) => {handleDrop(e, groupById)}} 
											onDragOver={enableDropping} 
										>
											<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-px-2 tw-pb-2">
												{
													groupedTickets[groupById][status.id]?.map((ticketId: number) => {
														const ticket = tickets.find((t: TicketType) => t.id === ticketId)
														return (
															<div 
																onClick={() => {
																	dispatch(toggleShowModal(true))
																	dispatch(setModalType("EDIT_TICKET_FORM"))
																	dispatch(selectCurrentTicketId(ticketId))	
																}}
																key = {`group_by_${groupById}_ticket_${ticketId}`} 
																id = {`group_by_${groupById}_ticket_${ticketId}`}
																draggable
																onDragStart={dragStart}
																>
																{ticket ? <Ticket 
																	ticket = {ticket}
																/> : null}
															</div>
														)
													})
												}
											</div>
										</div>
									)
								})
							}
							</div>
						) : null}
					</div>
				)
			})}
		</div>
	)
}

