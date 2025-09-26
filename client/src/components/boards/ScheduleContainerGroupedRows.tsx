import React, { useState, useCallback } from "react"
import { IconArrowDown } from "../icons/IconArrowDown"
import { IconArrowUp } from "../icons/IconArrowUp"
import { Ticket, ViewMode, GroupByElement } from "../../types/common"
import { useAppSelector } from "../../hooks/redux-hooks"
import { applyGroupModifier } from "../../helpers/groupBy"
import { useGetGroupByElementsQuery } from "../../services/private/groupBy"
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"

interface Props {
    tickets?: Array<Ticket>
    viewMode: ViewMode
    calculateTaskPosition: (ticket: Ticket) => Record<string, string>
}

export const ScheduleContainerGroupedRows = ({tickets = [], viewMode, calculateTaskPosition}: Props) => {
    const { groupBy } = useAppSelector((state) => state.board)
    const { ticketTypes } = useAppSelector((state) => state.ticketType)
    const groupedTickets = applyGroupModifier(groupBy, tickets)
    /* object mapping the group by ids to boolean to denote whether the collapse arrow for that section is on/off */
	const {data: groupByElements, isLoading, isError} = useGetGroupByElementsQuery({groupBy: groupBy, ids: Object.keys(groupedTickets)})  
	const [collapseArrows, setCollapseArrows] = useState<Record<string, boolean>>(
		Object.keys(groupedTickets).reduce((acc: Record<string, boolean>, key: string) => {
		acc[key] = false
		return acc
	}, {}))
    return (
        <>
            {
                !isLoading ? 
                    Object.keys(groupedTickets).map((groupById: string) => {
						const groupByElement = groupByElements?.find((element: GroupByElement) => element.id === parseInt(groupById))
                        return (
                            <>
                                <div className = "tw-flex tw-items-center">
                                    <div className="tw-w-48 tw-p-3 tw-border-r">
                                        <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
                                            <button onClick={() => {
                                                setCollapseArrows({...collapseArrows, [groupById]: !collapseArrows[groupById]})
                                            }}>
                                                <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                                                    {groupByElement?.name}
                                                    {collapseArrows[groupById] ? <IconArrowUp /> : <IconArrowDown />}
                                                </div>
                                            </button>
                                        </div>
                                    </div> 
                                    <div className="tw-flex-1 tw-relative tw-h-12 tw-flex tw-items-center">
                                    </div>
                                </div>
                                {groupedTickets[groupById].map((ticket, index) => {
                                    const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
                                    const position = calculateTaskPosition(ticket)
                                    if (collapseArrows[groupById]) {
                                        return null;
                                    }
                                    return (
                                        <div key={ticket.id} className="tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
                                            <div className = "tw-w-48 tw-p-3 tw-border-r">
                                            </div>
                                            <div className="tw-flex-1 tw-relative tw-h-12 tw-flex tw-items-center">
                                                <div
                                                    className="tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
                                                    style={{
                                                        left: position.left,
                                                        width: position.width,
                                                        backgroundColor: TICKET_TYPE_COLOR_MAP[ticketType as keyof typeof TICKET_TYPE_COLOR_MAP] || '#3B82F6',
                                                        minWidth: '2px'
                                                    }}
                                                >
                                                    {parseFloat(position.width) > 10 && (
                                                        <span className="tw-truncate tw-px-2">{ticket.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        )
                    })
                : null
            }
        </>
    )
}