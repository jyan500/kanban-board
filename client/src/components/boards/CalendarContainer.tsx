import React, { useState } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    addDays, 
    addMonths, 
    isToday as isTodayFns,
    getDay,
    isBefore,
    isAfter,
    getDate,
    eachDayOfInterval
} from 'date-fns'

interface Ticket {
    id: string
    title: string
    startDate: Date
    endDate: Date
    color: string
}

export const CalendarContainer: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date())

    // Mock ticket data - assumes these are already filtered for the current month
    const tickets: Ticket[] = [
        {
            id: '1',
            title: 'ST Sprint 3',
            startDate: new Date(2025, 11, 5), // Dec 1, 2024
            endDate: new Date(2025, 11, 7), // Dec 18, 2024
            color: 'tw-bg-blue-200'
        },
        {
            id: '2',
            title: 'ST-28 test test',
            startDate: new Date(2025, 11, 12), // Jan 1, 2025
            endDate: new Date(2025, 11, 13), // Jan 1, 2025
            color: 'tw-bg-blue-300'
        },
        {
            id: '3',
            title: 'ST-29 test test',
            startDate: new Date(2025, 11, 11), // Jan 1, 2025
            endDate: new Date(2025, 11, 14), // Jan 1, 2025
            color: 'tw-bg-blue-300'
        }
    ]

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    /* 
    generate all calendar days in the month, this includes the entire week during
    the 1st day of the month, and also the entire week of the last day of the month.
    */
    const generateCalendarDays = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }

    const getTicketDisplayForWeek = (ticket: Ticket, weekStartDate: Date) => {
        const weekEndDate = addDays(weekStartDate, 6)
    
        /* 
        If ticket started before this week, show it starting from Monday of this week. 
        Otherwise, use the ticket's actual start date.
        */        
        const displayStart = isBefore(ticket.startDate, weekStartDate) ? weekStartDate : ticket.startDate
        /* 
        If a ticket ends after this week, show it ending on Sunday of this week.
        Otherwise use the ticket's actual end date.
        */
        const displayEnd = isAfter(ticket.endDate, weekEndDate) ? weekEndDate : ticket.endDate
        
        const startDay = getDate(displayStart)
        const endDay = getDate(displayEnd)
        const dayOfWeek = getDay(displayStart)
        const startCol = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday = 0
        const span = endDay - startDay + 1
        
        return {
            ...ticket,
            startCol,
            span
        }
    }

    const changeMonth = (delta: number) => {
        setCurrentDate(addMonths(currentDate, delta))
    }

    const calendarDays = generateCalendarDays()
    const weeks: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7))
    }

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth()
    }

    return (
        <div className="tw-max-w-7xl tw-mx-auto tw-p-4">
            <div className="tw-bg-white tw-rounded-lg tw-border">
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-border-b">
                    <h2 className="tw-text-xl tw-font-semibold">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="tw-flex tw-gap-2">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="tw-p-2 hover:tw-bg-gray-100 tw-rounded"
                        >
                            <IoChevronBack className="tw-w-5 tw-h-5" />
                        </button>
                        <button
                            onClick={() => changeMonth(1)}
                            className="tw-p-2 hover:tw-bg-gray-100 tw-rounded"
                        >
                            <IoChevronForward className="tw-w-5 tw-h-5" />
                        </button>
                    </div>
                </div>

                {/* Days of week header */}
                <div className="tw-grid tw-grid-cols-7 tw-border-b">
                    {daysOfWeek.map(day => (
                        <div key={day} className="tw-p-3 tw-text-center tw-text-sm tw-font-medium tw-text-gray-600 tw-border-r last:tw-border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="tw-divide-y">
                    {weeks.map((week, weekIndex) => {
                        const weekStartDate = week[0]
                        const weekEndDate = week[6]
                        
                        // Filter tickets that appear in this week
                        const weekTickets = tickets
                            .filter(ticket => 
                                !(isAfter(ticket.startDate, weekEndDate) || isBefore(ticket.endDate, weekStartDate))
                            )
                            .map(ticket => getTicketDisplayForWeek(ticket, weekStartDate))
                        
                        return (
                            <div key={weekIndex} className="tw-relative">
                                <div className="tw-grid tw-grid-cols-7 tw-min-h-32">
                                    {week.map((date, dayIndex) => (
                                        <div
                                            key={dayIndex}
                                            className={`tw-border-r last:tw-border-r-0 tw-p-2 tw-min-h-32 ${
                                                !isCurrentMonth(date) ? 'tw-bg-gray-50' : ''
                                            }`}
                                        >
                                            <div className={`tw-text-sm ${
                                                isTodayFns(date) 
                                                    ? 'tw-bg-blue-500 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center' 
                                                    : !isCurrentMonth(date) 
                                                    ? 'tw-text-gray-400'
                                                    : ''
                                            }`}>
                                                {format(date, 'd')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Tickets overlay */}
                                <div className="tw-absolute tw-top-8 tw-left-0 tw-right-0 tw-space-y-1">
                                    {weekTickets.map((ticket) => (
                                        <div
                                            key={`${ticket.id}-${weekIndex}`}
                                            className="tw-grid tw-grid-cols-7 tw-gap-0"
                                            style={{ gridColumn: '1 / span 7' }}
                                        >
                                            <div
                                                className={`${ticket.color} tw-rounded tw-px-2 tw-py-1 tw-text-xs tw-flex tw-items-center`}
                                                style={{
                                                    gridColumn: `${ticket.startCol + 1} / span ${ticket.span}`
                                                }}
                                            >
                                                <span className="tw-mr-1">🔄</span>
                                                {ticket.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

