/* 
Structure board by groups to prevent users from moving a ticket between groups
*/
import React, { useState } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { KanbanBoard, GroupedTickets, GroupByOptionsKey, Status, GroupByElement, Ticket as TicketType } from "../../types/common"
import { useGetGroupByElementsQuery } from "../../services/private/groupBy"
import { Ticket } from "../Ticket"
import { IconButton } from "../page-elements/IconButton"
import { IconContext } from "react-icons"
import { IoIosArrowDown as ArrowDown, IoIosArrowUp as ArrowUp } from "react-icons/io";
import { LoadingSpinner } from "../LoadingSpinner"

type Props = {
	groupedTickets: GroupedTickets
	tickets: Array<TicketType>
	board: KanbanBoard
	groupBy: GroupByOptionsKey 
	statusesToDisplay: Array<Status>
	allStatuses: Array<Status>
	boardStyle: Record<string, string>
}

export const GroupedBoard = ({
	allStatuses, 
	board, 
	boardStyle, 
	tickets,
	groupedTickets, 
	groupBy, 
	statusesToDisplay
}: Props) => {
	/* object mapping the group by ids to boolean to denote whether the collapse arrow for that section is on/off */
	const [collapseArrows, setCollapseArrows] = useState<Record<string, boolean>>(
		Object.keys(groupedTickets).reduce((acc: Record<string, boolean>, key: string) => {
		acc[key] = false
		return acc
	}, {}))
	const {data: groupByElements, isLoading, isError} = useGetGroupByElementsQuery({groupBy: groupBy, ids: Object.keys(groupedTickets)})  
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<div style={boardStyle}>
				{statusesToDisplay.map((status: Status) => {
					return (
						<div
						className = "tw-flex tw-flex-col tw-bg-gray-50"
						>
							<>
								<div className = "tw-ml-2 tw-py-2 tw-flex tw-flex-row tw-items-center tw-gap-x-2">
									<p className = "tw-font-bold">
										{allStatuses.find((s: Status) => s.id === status.id)?.name}
									</p>
									<span>
										{board[status.id]?.length}
									</span>
								</div>
							</>
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
										<div className = "tw-flex tw-flex-col tw-bg-gray-50 tw-min-h-[400px] tw-pt-2">
											<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-px-2 tw-pb-2">
												{
													groupedTickets[groupById][status.id]?.map((ticketId: number) => {
														const ticket = tickets.find((t: TicketType) => t.id === ticketId)
														return (
															<div 
																key = {ticketId} 
																id = {`grouped_ticket_${ticketId}`}
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

