/* 
Structure board by groups to prevent users from moving a ticket between groups
*/
import React from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { KanbanBoard, GroupedTickets, GroupByOptionsKey, Status, GroupByElement, Ticket as TicketType } from "../../types/common"
import { Ticket } from "../Ticket"

type Props<T> = {
	groupedTickets: GroupedTickets
	tickets: Array<TicketType>
	board: KanbanBoard
	groupBy: GroupByOptionsKey 
	groupByElements: Array<T> 
	statusesToDisplay: Array<Status>
	allStatuses: Array<Status>
	boardStyle: Record<string, string>
}

export const GroupedBoard = <T extends GroupByElement>({
	allStatuses, 
	board, 
	boardStyle, 
	tickets,
	groupedTickets, 
	groupBy, 
	groupByElements, 
	statusesToDisplay
}: Props<T>) => {
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
				const groupByElement = groupByElements.find((element: GroupByElement) => element.id === parseInt(groupById))
				return (
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						<div style = {boardStyle}>
							<div className = "tw-flex tw-flex-row tw-gap-x-2">
								<p className = "tw-font-bold">{groupByElement?.name}</p>
								<p>{`${groupByElement ? Object.values(groupedTickets[groupById]).reduce((acc: number, arr: Array<number>) => 
									acc + arr.length, 0) : 0} issues`}</p>
							</div>
						</div>
						<div style = {boardStyle}>
						{
							statusesToDisplay.map((status) => {
								return (
									<div className = "tw-flex tw-flex-col tw-bg-gray-50 tw-min-h-[400px]">
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
					</div>
				)
			})}
		</div>
	)
}

