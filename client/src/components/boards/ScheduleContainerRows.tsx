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

interface Props {
    tickets?: Array<Ticket>
    viewMode: ViewMode
    currentDate: Date
    periodStart: Date
    periodEnd: Date
}

export const ScheduleContainerRows = ({
    tickets = [], 
    viewMode,
    currentDate,
    periodStart,
    periodEnd,
}: Props) => {
    const { ticketTypes } = useAppSelector((state) => state.ticketType)
    const { groupBy } = useAppSelector((state) => state.board)

    // Format date for display
    const formatDate = (date: Date) => {
        if (viewMode === 'week') {
            return format(date, 'EEE d') // e.g., "Mon 23"
        } else {
            return format(date, 'd') // e.g., "23"
        }
    }

    // Get current period label
    const getCurrentPeriodLabel = () => {
        if (viewMode === 'week') {
            const start = startOfWeek(currentDate)
            const end = endOfWeek(currentDate)
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}` // e.g., "Sep 22 - Sep 28, 2024"
        } else {
            return format(currentDate, 'yyyy MMMM') // e.g., "2024 September"
        }
    }

    const timeColumns = useMemo(() => {
        if (viewMode === 'week') {
            // Generate daily columns for week view
            return eachDayOfInterval({ start: periodStart, end: periodEnd })
        }
        // Generate daily columns for month view
        return eachDayOfInterval({ start: periodStart, end: periodEnd })
    }, [viewMode, periodStart, periodEnd])

    // Calculate task bar position and width
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
    //     <div className="tw-flex tw-flex-row">
    //     {tickets.length === 0 ? (
    //         <div className="tw-p-8 tw-text-center tw-text-gray-500">
    //             No tasks found for the current {viewMode} period
    //         </div>
    //     ) : (
    //         groupBy === "NONE" ? 
    //         <>
    //             <div className = "tw-flex tw-flex-col tw-w-48 tw-divide-y tw-divide-gray-100 ">
    //                 <div className = "tw-p-3 tw-font-medium tw-text-gray-700 tw-border-r tw-border-gray-200 tw-h-12">
    //                     {groupBy === "NONE" ? "Tasks" : GROUP_BY_OPTIONS[groupBy as GroupByOptionsKey]}
    //                 </div>
    //                 {tickets.map((ticket => {
    //                     return (
    //                         <div className = "tw-p-3 tw-border-r tw-border-gray-200">
    //                             <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
    //                                 {ticket.name}
    //                             </div>
    //                             <div className="tw-text-xs tw-text-gray-500">
    //                                 {new Date(ticket.createdAt).toLocaleDateString()} - {new Date(ticket.dueDate).toLocaleDateString()}
    //                             </div>
    //                         </div>
    //                     )
    //                 }))}
    //             </div>
    //             <div className = "tw-flex tw-flex-col tw-flex-1 tw-overflow-x-auto">
    //                 <div className = "tw-flex tw-flex-row tw-flex-1">
    //                     {timeColumns.map((date, index) => (
    //                         <div
    //                             key={index}
    //                             className="tw-flex-1 tw-h-12 tw-p-2 tw-text-center tw-text-sm tw-font-medium tw-text-gray-600 tw-border-r tw-border-gray-200 tw-min-w-[60px]"
    //                         >
    //                             {formatDate(date)}
    //                         </div>
    //                     ))}
    //                 </div>
    //                 {
    //                     tickets.map((ticket) => {
    //                     const position = calculateTaskPosition(ticket)
    //                     const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
    //                         return (
    //                             <div className="tw-flex-1 tw-relative tw-h-12 tw-flex tw-flex-row tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
    //                                 <div
    //                                     className="tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
    //                                     style={{
    //                                         left: position.left,
    //                                         width: position.width,
    //                                         backgroundColor: TICKET_TYPE_COLOR_MAP[ticketType as keyof typeof TICKET_TYPE_COLOR_MAP] || '#3B82F6',
    //                                         minWidth: '2px'
    //                                     }}
    //                                 >
    //                                     {parseFloat(position.width) > 10 && (
    //                                         <span className="tw-truncate tw-px-2">{ticket.name}</span>
    //                                     )}
    //                                 </div>
    //                             </div>
    //                         )
    //                     })
    //                 }
    //             </div>
    //         </>
    //         // tickets.map(ticket => {
    //         //     const position = calculateTaskPosition(ticket)
    //         //     const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
    //         //     return (
    //         //         <div key={ticket.id} className="tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
    //         //             <div className="tw-w-48 tw-p-3 tw-border-r tw-border-gray-200">
    //         //                 <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
    //         //                     {ticket.name}
    //         //                 </div>
    //         //                 <div className="tw-text-xs tw-text-gray-500">
    //         //                     {new Date(ticket.createdAt).toLocaleDateString()} - {new Date(ticket.dueDate).toLocaleDateString()}
    //         //                 </div>
    //         //             </div>
    //         //             <div className="tw-flex-1 tw-relative tw-h-12 tw-flex tw-items-center">
    //         //                 <div
    //         //                     className="tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
    //         //                     style={{
    //         //                         left: position.left,
    //         //                         width: position.width,
    //         //                         backgroundColor: TICKET_TYPE_COLOR_MAP[ticketType as keyof typeof TICKET_TYPE_COLOR_MAP] || '#3B82F6',
    //         //                         minWidth: '2px'
    //         //                     }}
    //         //                 >
    //         //                     {parseFloat(position.width) > 10 && (
    //         //                         <span className="tw-truncate tw-px-2">{ticket.name}</span>
    //         //                     )}
    //         //                 </div>
    //         //             </div>
    //         //         </div>
    //         //     )
    //         // }) 
    //         : <ScheduleContainerGroupedRows calculateTaskPosition={calculateTaskPosition} tickets={tickets}/>
    //     )}
    // </div>
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
                                <div key={`label-${ticket.id}`} className="tw-p-3">
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
                            min-w-max allows the header + taskbar to allow the width calculations to take up the full width needed (including the amount the user needs to scroll if overflow is triggered 
                            This also fixes issues with styling and coloring not extending past the scroll.
                        */}
                        <div className="tw-min-w-max">
                            {/* Header row */}
                            <div className="tw-flex tw-flex-row tw-border-b tw-border-gray-200">
                                {timeColumns.map((date, index) => (
                                    <div
                                        key={index}
                                        className="tw-flex-1 tw-h-12 tw-p-2 tw-text-center tw-text-sm tw-font-medium tw-text-gray-600 tw-border-r tw-border-gray-200 tw-min-w-[60px]"
                                    >
                                        {formatDate(date)}
                                    </div>
                                ))}
                            </div>
    
                            {/* Task bar rows */}
                            <div className="tw-divide-y tw-divide-gray-100">
                                {tickets.map((ticket) => {
                                    const position = calculateTaskPosition(ticket)
                                    const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
                                    return (
                                        <div key={`bar-${ticket.id}`} className="tw-relative tw-h-12 tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
                                            {/* Invisible column structure to maintain width */}
                                            {/* <div className="tw-flex tw-flex-row tw-w-full">
                                                {timeColumns.map((date, index) => (
                                                    <div
                                                        key={index}
                                                        className="tw-flex-1 tw-min-w-[60px]"
                                                    />
                                                ))}
                                            </div> */}
                                            {/* Absolutely positioned task bar */}
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
                                    )
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