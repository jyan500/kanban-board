import React, { useCallback, useMemo } from "react"
import { useAppSelector } from "../../hooks/redux-hooks"
import { GroupByOptionsKey, Ticket, ViewMode } from "../../types/common"
import { applyGroupModifier } from "../../helpers/groupBy"
import { GROUP_BY_OPTIONS, TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"
import { 
    startOfWeek, 
    endOfWeek, 
    format,
    subWeeks, 
    addWeeks, 
    subMonths, 
    addMonths,
    eachDayOfInterval, 
    differenceInDays, 
    startOfDay, 
    endOfDay, 
    isBefore, 
    isAfter, 
    differenceInMilliseconds 
} from "date-fns"
import { useGetGroupByElementsQuery } from "../../services/private/groupBy"
import { ScheduleContainerGroupedRows } from "./ScheduleContainerGroupedRows"
import { ScheduleContainerRowTicket} from "./ScheduleContainerRowTicket"

interface Props {
    tickets?: Array<Ticket>
    viewMode: ViewMode
    currentDate: Date
    periodStart: Date
    periodEnd: Date
    timeColumns: React.ReactNode
}

export const ScheduleContainerRows = ({
    tickets = [], 
    viewMode,
    currentDate,
    periodStart,
    periodEnd,
    timeColumns,
}: Props) => {
    const { ticketTypes } = useAppSelector((state) => state.ticketType)
    const { groupBy } = useAppSelector((state) => state.board)

    const calculateTaskPosition = (ticket: Ticket) => {
        // Normalize to day boundaries
        const taskStart = startOfDay(new Date(ticket.createdAt))
        const taskEnd = endOfDay(new Date(ticket.dueDate))
        
        const normalizedPeriodStart = startOfDay(periodStart)
        const normalizedPeriodEnd = endOfDay(periodEnd)
        
        // Clamp task dates to visible period
        const visibleStart = isBefore(taskStart, normalizedPeriodStart) ? normalizedPeriodStart : taskStart
        const visibleEnd = isAfter(taskEnd, normalizedPeriodEnd) ? normalizedPeriodEnd : taskEnd
        
        // Calculate which day columns the task spans
        const totalDays = eachDayOfInterval({ start: normalizedPeriodStart, end: normalizedPeriodEnd }).length
        const daysFromStart = differenceInDays(visibleStart, normalizedPeriodStart)
        const taskDurationDays = differenceInDays(visibleEnd, visibleStart) + 1 // +1 to include both start and end days
        
        // Calculate percentage based on day columns, not pure time
        const leftPercentage = ((daysFromStart / totalDays) * 100)
        const widthPercentage = (taskDurationDays / totalDays) * 100
        
        return {
            left: `${Math.max(0, leftPercentage)}%`,
            width: `${Math.min(100 - leftPercentage, widthPercentage)}%`
        }
    }

    return (
        <div className="tw-flex tw-flex-col">
            {tickets.length === 0 ? (
                <div className="tw-p-8 tw-text-center tw-text-gray-500">
                    No tasks found for the current {viewMode} period
                </div>
            ) : (
                groupBy === "NONE" ? 
                <div className="tw-flex tw-flex-row">
                    {/* Fixed left column for task names */}
                    <div className="tw-w-48 tw-flex-shrink-0 tw-border-r tw-border-gray-200">
                        <div className="tw-p-3 tw-font-medium tw-text-gray-700 tw-h-12 tw-border-b tw-border-gray-200">
                            Tasks
                        </div>
                        <div className="tw-divide-y tw-divide-gray-100">
                            {tickets.map((ticket) => (
                                <div key={`label-${ticket.id}`} className="tw-h-12 tw-p-3">
                                    <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
                                        {ticket.name}
                                    </div>
                                    <div className="tw-text-xs tw-text-gray-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()} - {new Date(ticket.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
    
                    {/* Scrollable section with header and task bars */}
                    <div className="tw-flex-1 tw-overflow-x-auto">
                        {/* 
                            wrapping both the time columns and ticket sections in
                            min-w-max allows the header + taskbar width calculations to account for the full width needed, including the amount the user needs to scroll if overflow is triggered 
                            This also fixes issues with styling and coloring not extending past the scroll.
                        */}
                        <div className="tw-min-w-max">
                            {/* Header row */}
                            {timeColumns}
                            {/* Task bar rows */}
                            <div className="tw-divide-y tw-divide-gray-100">
                                {tickets.map((ticket) => {
                                    const position = calculateTaskPosition(ticket)
                                    const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
                                    return (<ScheduleContainerRowTicket ticket={ticket} ticketType={ticketType} position={position}/>)
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                : <ScheduleContainerGroupedRows calculateTaskPosition={calculateTaskPosition} tickets={tickets}/>
            )}
        </div>
    )
}