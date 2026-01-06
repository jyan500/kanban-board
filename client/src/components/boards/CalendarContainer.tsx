import React, { useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { IconArrowRight } from "../../components/icons/IconArrowRight"
import { IconArrowLeft } from "../../components/icons/IconArrowLeft"
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
    isSameDay,
    differenceInDays,
    getDate,
    eachDayOfInterval
} from 'date-fns'
import { SearchToolBar } from "../tickets/SearchToolBar"
import type { FormValues, CalendarData } from "../../pages/boards/BoardCalendar"
import { Ticket, Sprint } from "../../types/common"
import { FilterButton } from "../../components/page-elements/FilterButton"
import { IconTicket } from "../../components/icons/IconTicket"
import { IconCycle } from "../../components/icons/IconCycle"
import { useForm, FormProvider, useFormContext} from "react-hook-form"
import { Link } from "react-router-dom"
import { BOARDS, BACKLOG } from "../../helpers/routes"
import { LoadingSkeleton } from '../page-elements/LoadingSkeleton'
import { selectCurrentTicketId } from '../../slices/boardSlice'
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { SprintPreviewDropdown } from '../dropdowns/SprintPreviewDropdown'
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { CalendarSprintContainer } from './CalendarSprintContainer'
import { v4 as uuidv4 } from "uuid"

interface Props {
    currentDate: Date
    periodStart: Date
    periodEnd: Date
    setCurrentDate: (date: Date) => void
    isCalendarLoading?: boolean
    numFilters: number
    onSubmit: (values: FormValues) => void
    calendarData: Array<CalendarData>
    boardId: number
}

interface CalendarContainerSearchBarProps { 
    onSubmit: (values: FormValues) => void
    numFilters: number
    boardId: number
}

const CalendarContainerSearchBar = ({
    onSubmit,
    numFilters,
    boardId,
}: CalendarContainerSearchBarProps) => {
    const dispatch = useAppDispatch()
    const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods
    return (
        <div className = "tw-flex tw-flex-col tw-gap-y-2 sm:tw-w-full lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
            <FormProvider {...methods}>
                <SearchToolBar 
                    hidePagination={true}
                    registerOptions={{}}
                    searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
                    additionalButtons={
                    () => {
                        return (
                            <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                                <FilterButton
                                    onClick={() => {
                                        dispatch(setSecondaryModalType("BOARD_FILTER_MODAL"))
                                        dispatch(setSecondaryModalProps({boardId: boardId, isBulkEdit: false}))
                                        dispatch(toggleShowSecondaryModal(true))
                                    }}
                                    numFilters={numFilters}
                                />
                            </div>
                        )
                    }
                    }
                    onFormSubmit={async () => {
                        await handleSubmit(onSubmit)()
                    }}
                >
                </SearchToolBar>
            </FormProvider>

        </div>
    )
}

export const CalendarContainer = ({
    calendarData, 
    currentDate,
    setCurrentDate,
    periodStart, 
    periodEnd, 
    onSubmit,
    numFilters,
    boardId,
    isCalendarLoading=false, 
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const methods = useFormContext<FormValues>()
    const dispatch = useAppDispatch()

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

    /* 
    Based on the week start date,
    calculate how many columns the element should span for that week,
    as well as the ticket's start column within the 2-D weeks array to
    be used in the CSS rule for grid-column: start / end
    
    Note that currently, only sprints will span across multiple dates on the calendar,
    but tickets will only show on their due date
    */
    const getSprintDisplayForWeek = (element: CalendarData, weekStartDate: Date) => {
        const weekEndDate = addDays(weekStartDate, 6)
        /* 
        If sprint started before this week, show it starting from Monday of this week. 
        Otherwise, use the ticket's actual start date.
        */        
        const displayStart = isBefore(element.startDate, weekStartDate) ? weekStartDate : element.startDate
        /* 
        If a sprint ends after this week, show it ending on Sunday of this week.
        Otherwise use the sprint's actual end date.
        */
        const displayEnd = isAfter(element.endDate, weekEndDate) ? weekEndDate : element.endDate
        /* 
        get only the day number of the date i.e Dec 3 -> 3,
        */ 
        const startDay = getDate(displayStart)
        const endDay = getDate(displayEnd)
        /* 
        Day of the week returns 0=Sunday,1=Monday,6=Saturday,
        to convert this to the grid where Monday=0 (since its indexed by 0 in the 2-D array),
        if Sunday, convert to 6. Otherwise, subtract 1 from the current day number

        subtract the difference between the columns + 1 to get the total span
        */
        const dayOfWeek = getDay(displayStart)
        const endDayOfWeek = getDay(displayEnd)
        const startCol = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday = 0
        const endCol = endDayOfWeek === 0 ? 6 : endDayOfWeek - 1 // Convert to Monday = 0
        const span = endCol - startCol + 1
        
        return {
            ...element,
            startCol,
            span
        }
    }

    const getTicketsForDate = (date: Date) => {
        return calendarData.filter(data => {
            return data.type === "Ticket" && isSameDay(data.endDate, date)
        })
    }

    const changeMonth = (delta: number) => {
        setCurrentDate(addMonths(currentDate, delta))
    }

    const calendarDays = generateCalendarDays()

    /* 
    Generate a 2-D array structure that contains X amount of weeks
    in the month as rows, and 7 days per week as columns
    */
    const weeks: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7))
    }

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth()
    }

    return (
        <div className="tw-max-w-7xl tw-mx-auto tw-p-4">
            <div className="tw-bg-white tw-rounded-lg tw-border tw-flex tw-flex-col tw-gap-y-4">
                {/* Header */}
                <div className = "tw-flex tw-flex-col tw-gap-y-2 tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <h2 className="tw-text-xl tw-font-semibold">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="tw-p-2 hover:tw-bg-gray-100 tw-rounded"
                            >
                                <IconArrowLeft className="tw-w-5 tw-h-5" />
                            </button>
                            <button
                                onClick={() => changeMonth(1)}
                                className="tw-p-2 hover:tw-bg-gray-100 tw-rounded"
                            >
                                <IconArrowRight className="tw-w-5 tw-h-5" />
                            </button>
                        </div>
                    </div>
                    <FormProvider {...methods}>
                        <CalendarContainerSearchBar
                            onSubmit={onSubmit}
                            numFilters={numFilters}
                            boardId={boardId}
                        />
                    </FormProvider>
                </div>

                {/* Days of week header */}
                <div className = "tw-border-t">
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
                            
                            // Filter sprints that appear in this week
                            const weekSprints = calendarData
                                .filter(data => 
                                    data.type === "Sprint" && 
                                    (!(isAfter(data.startDate, weekEndDate) || isBefore(data.endDate, weekStartDate)))
                                )
                                .map(data => getSprintDisplayForWeek(data, weekStartDate))

                            return (
                                <div key={weekIndex} className="tw-relative">
                                    <div className="tw-grid tw-grid-cols-7 tw-min-h-32">
                                        {week.map((date, dayIndex) => {
                                            const dateTickets = getTicketsForDate(date)
                                            /* 
                                                The overlapping is determined by the day indices,
                                                for example 0 = Monday, ... 6 = Sunday
                                                If sprint has a startCol of index 1 and ends at index 6,
                                                and the day we're checking for is 0, we can see that this 
                                                condition would return False since 0 < 1
                                            */
                                            const sprintsOverlappingDate = weekSprints.filter(sprint => {
                                                const sprintStartsOnOrBefore = dayIndex >= sprint.startCol
                                                const sprintEndsOnOrAfter = dayIndex < sprint.startCol + sprint.span
                                                return sprintStartsOnOrBefore && sprintEndsOnOrAfter
                                            })
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`tw-z-0 tw-flex tw-flex-col tw-relative hover:tw-bg-gray-100 tw-border-r last:tw-border-r-0 tw-p-2 tw-min-h-32 ${
                                                        !isCurrentMonth(date) ? 'tw-bg-gray-50' : ''
                                                    }`}
                                                >
                                                    {/* 
                                                        Highlight today's date with a blue circle within the calendar cell.
                                                        If a date is not in the current month (but still in the current week),
                                                        the cell will be gray colored
                                                    */}
                                                    <div className={`tw-absolute tw-top-0 tw-left-0 tw-ml-1 tw-mt-1 tw-text-sm ${
                                                        isTodayFns(date) 
                                                            ? 'tw-bg-blue-500 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center' 
                                                            : !isCurrentMonth(date) 
                                                            ? 'tw-text-gray-400'
                                                            : ''
                                                    }`}>
                                                        {format(date, 'd')}
                                                    </div>

                                                    <div className = "tw-py-3"></div>
                                                    {/* Space for sprints only if they overlap this date so the tickets display under the sprints. 
                                                    For each additional sprint, you need to include additional padding
                                                    to account for the slight padding that occurs between each sprint */}
                                                    {sprintsOverlappingDate.length > 0 ? (
                                                        <div style={{ height: `${(sprintsOverlappingDate.length * 26) + ((sprintsOverlappingDate.length + .20) * 2)}px` }} />
                                                    ) : null}
                                                    
                                                    <div className = "tw-flex tw-flex-col tw-gap-y-1 tw-w-full">
                                                        {dateTickets.map((ticket) => {
                                                            return (
                                                                <button 
                                                                    className = {`${ticket.color} tw-rounded tw-px-2 tw-py-1 tw-font-medium tw-text-xs tw-flex tw-items-center tw-w-full tw-text-left`}
                                                                    key={ticket.id}
                                                                    onClick={(e) => {
                                                                        dispatch(toggleShowModal(true))
                                                                        dispatch(setModalType("EDIT_TICKET_FORM"))
                                                                        dispatch(selectCurrentTicketId(ticket.id))
                                                                    }}
                                                                >
                                                                    <span className="tw-mr-1"><IconTicket/></span>
                                                                    <span className="tw-truncate">{ticket.name}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    
                                    {/* 
                                        Tickets overlay 
                                        Uses pointer-events-none as a hack so that the overlay that spans the entire week row doesn't
                                        interfere with the hover on each cell. However, pointer-events are enabled on the ticket itself.
                                    */}
                                    <div className="tw-pointer-events-none tw-absolute tw-top-8 tw-left-0 tw-right-0 tw-space-y-1">
                                        {weekSprints.map((data) => (
                                            <div key={`${data.id}-${weekIndex}`}>
                                                <CalendarSprintContainer data={data} boardId={boardId} uniqueKey={uuidv4()}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

