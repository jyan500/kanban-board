/* 
Structure board by groups to prevent users from moving a ticket between groups
*/
import React from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { KanbanBoard, GroupedTickets, GroupByOptionsKey, Status, GroupByElement } from "../../types/common"

type Props<T> = {
	groupedTickets: GroupedTickets
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
	groupedTickets, 
	groupBy, 
	groupByElements, 
	statusesToDisplay
}: Props<T>) => {
	return (
		<>
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
					<div style = {boardStyle}>
						<p>{groupByElement?.name}</p>
					</div>
				)
			})}
		</>
	)
}

