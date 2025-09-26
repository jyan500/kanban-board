import React, { useCallback } from "react"
import { useAppSelector } from "../../hooks/redux-hooks"
import { Ticket, ViewMode } from "../../types/common"
import { applyGroupModifier } from "../../helpers/groupBy"
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"
import { isBefore, isAfter, differenceInMilliseconds } from "date-fns"
import { useGetGroupByElementsQuery } from "../../services/private/groupBy"
import { ScheduleContainerGroupedRows } from "./ScheduleContainerGroupedRows"

interface Props {
    tickets?: Array<Ticket>
    viewMode: ViewMode
    periodStart: Date,
    periodEnd: Date
}

export const ScheduleContainerRows = ({
    tickets = [], 
    viewMode,
    periodStart,
    periodEnd,
}: Props) => {
    const { ticketTypes } = useAppSelector((state) => state.ticketType)
    const { groupBy } = useAppSelector((state) => state.board)
    // Calculate task bar position and width
    const calculateTaskPosition = (ticket: Ticket) => {
        const taskStart = new Date(ticket.createdAt)
        const taskEnd = new Date(ticket.dueDate)
        
        // Clamp task dates to visible period
        const visibleStart = isBefore(taskStart, periodStart) ? periodStart : taskStart
        const visibleEnd = isAfter(taskEnd, periodEnd) ? periodEnd : taskEnd
        
        // Calculate time differences
        const totalPeriodMs = differenceInMilliseconds(periodEnd, periodStart)
        const taskStartMs = differenceInMilliseconds(visibleStart, periodStart)
        const taskDurationMs = differenceInMilliseconds(visibleEnd, visibleStart)
        
        const leftPercentage = (taskStartMs / totalPeriodMs) * 100
        const widthPercentage = (taskDurationMs / totalPeriodMs) * 100
        
        return {
            left: `${Math.max(0, leftPercentage)}%`,
            width: `${Math.min(100 - leftPercentage, widthPercentage)}%`
        }
    }

    return (
        <div className="tw-divide-y tw-divide-gray-100">
        {tickets.length === 0 ? (
            <div className="tw-p-8 tw-text-center tw-text-gray-500">
                No tasks found for the current {viewMode} period
            </div>
        ) : (
            groupBy === "NONE" ? 
            tickets.map(ticket => {
                const position = calculateTaskPosition(ticket)
                const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
                return (
                    <div key={ticket.id} className="tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
                        <div className="tw-w-48 tw-p-3 tw-border-r tw-border-gray-200">
                            <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
                                {ticket.name}
                            </div>
                            <div className="tw-text-xs tw-text-gray-500">
                                {new Date(ticket.createdAt).toLocaleDateString()} - {new Date(ticket.dueDate).toLocaleDateString()}
                            </div>
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
            }) : <ScheduleContainerGroupedRows calculateTaskPosition={calculateTaskPosition} tickets={tickets} viewMode={viewMode}/>
        )}
    </div>
    )
}