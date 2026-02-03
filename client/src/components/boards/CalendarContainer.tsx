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
    addWeeks,
    addMonths, 
    isToday as isTodayFns,
    getDay,
    isBefore,
    isAfter,
    isEqual,
    isSameDay,
    getDate,
    eachDayOfInterval
} from 'date-fns'
import { SearchToolBar } from "../tickets/SearchToolBar"
import type { FormValues, CalendarData } from "../../pages/boards/BoardCalendar"
import { ListResponse, OptionType, Ticket, Toast, Sprint, Status } from "../../types/common"
import { FilterButton } from "../../components/page-elements/FilterButton"
import { IconTicket } from "../../components/icons/IconTicket"
import { IconCycle } from "../../components/icons/IconCycle"
import { useForm, FormProvider, useFormContext} from "react-hook-form"
import { Link } from "react-router-dom"
import { useUpdateTicketDueDateMutation } from "../../services/private/ticket"
import { BOARDS, BACKLOG } from "../../helpers/routes"
import { LoadingSkeleton } from '../page-elements/LoadingSkeleton'
import { LoadingSpinner } from '../LoadingSpinner'
import { selectCurrentTicketId } from '../../slices/boardSlice'
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { SprintPreviewDropdown } from '../dropdowns/SprintPreviewDropdown'
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useScreenSize } from '../../hooks/useScreenSize'
import { PaginationRow } from '../page-elements/PaginationRow'
import { TicketRow } from "../TicketRow"
import { CalendarSprintContainer } from './CalendarSprintContainer'
import { v4 as uuidv4 } from "uuid"
import { CELL_BACKGROUND, LG_BREAKPOINT, PRIMARY_TEXT, SEARCH_OPTIONS, SECONDARY_TEXT, TABLE_BACKGROUND, CELL_HOVER } from '../../helpers/constants'
import { addToast } from '../../slices/toastSlice'
import { PaginationButtonRow } from '../page-elements/PaginationButtonRow'
import { Select } from '../page-elements/Select'

interface Props {
    currentDate: Date
    setCurrentDate: (date: Date) => void
    isWeekView: boolean
    viewOption: string
    setViewOption: (option: string) => void
    unscheduledTicketsPage: number,
    setUnscheduledTicketsPage: (page: number) => void,
    isCalendarLoading?: boolean
    unscheduledTickets: ListResponse<Ticket> | undefined
    numFilters: number
    onSubmit: (values: FormValues) => void
    calendarData: Array<CalendarData>
    boardId: number
    statusesToDisplay: Array<Status>
}

interface CalendarContainerSearchBarProps { 
    onSubmit: (values: FormValues) => void
    numFilters: number
    boardId: number
    isWeekView: boolean
    viewOption: string
    setViewOption: (weekOption: string) => void
}

const CalendarContainerSearchBar = ({
    onSubmit,
    numFilters,
    setViewOption,
    viewOption,
    isWeekView,
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
                    searchOptions = {SEARCH_OPTIONS}
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
                                <Select
                                    className="!tw-w-32"
                                    defaultValue={{label: viewOption, value: viewOption}}
                                    options={[
                                        {label: "Month", value: "Month"}, 
                                        {label: "Week", value: "Week"},
                                    ]}
                                    onSelect={(selectedOption: OptionType | null) => {
                                        if (selectedOption){
                                            setViewOption(selectedOption.value)
                                        }
                                    }}
                                    clearable={false}
                                    searchable={false}
                                >
                                </Select>
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
    isWeekView,
    unscheduledTicketsPage,
    setUnscheduledTicketsPage,
    setViewOption,
    viewOption,
    statusesToDisplay,
    unscheduledTickets,
    onSubmit,
    numFilters,
    boardId,
    isCalendarLoading=false, 
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [dragTicketId, setDragTicketId] = useState<number | null>()
    const [dragCellIndex, setDragCellIndex] = useState<Array<number>>([])
    const [ updateTicketDueDate, { isLoading, isError }] = useUpdateTicketDueDateMutation()

    const methods = useFormContext<FormValues>()
    const dispatch = useAppDispatch()

    const { width, height } = useScreenSize()
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const weekViewCalendarStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
    const weekViewCalendarEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

    /* 
    generate all calendar days in the month, this includes the entire week during
    the 1st day of the month, and also the entire week of the last day of the month.
    */
    const generateCalendarDays = () => {
        let calendarStart: Date;
        let calendarEnd: Date;
        if (!isWeekView){
            const monthStart = startOfMonth(currentDate)
            const monthEnd = endOfMonth(currentDate)
            calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
            calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
        }
        else {
            calendarStart = weekViewCalendarStart // Monday
            calendarEnd = weekViewCalendarEnd
        }

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
        if (!isWeekView){
            setCurrentDate(addMonths(currentDate, delta))
        }
        else {
            setCurrentDate(addWeeks(currentDate, delta))
        }
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

    const generateHeader = () => {
        const monthYear = format(currentDate, "MMMM yyyy")
        if (isWeekView){
            const weekStart = format(weekViewCalendarStart, "MMM d, yyyy")
            const weekEnd = format(weekViewCalendarEnd, "MMM d, yyyy")
            return `${weekStart} to ${weekEnd}`
        }
        return monthYear
    }

    const getTicketColor = (ticket: CalendarData) => {
        if (isBefore(ticket.endDate, new Date())){
           return "tw-bg-red-300 hover:tw-bg-red-400" 
        }
        return `${ticket.color} ${ticket.hoverColor}`
    }

    /* Handlers from drag and drop between the unscheduled tickets and calendar cells */
    const dragStart = (e: React.DragEvent<HTMLDivElement>) => {
		e.dataTransfer.setData("text", e.currentTarget.id)
	}

	const enableDropping = (e: React.DragEvent<HTMLDivElement>) => {
		/* 
			Because of the side scroll that appears on smaller screens, 
			disabling ticket dragging and movement for smaller screens
		*/
		if (width >= LG_BREAKPOINT){
			e.preventDefault()
		}
	}

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		const ticketId = parseInt(e.dataTransfer.getData("text").replace("to_update_ticket_", ""))
		const [weekIndex, dayIndex] = e.currentTarget.id.split("_").filter((part) => part !== "date")
        const parsedWeekIndex = parseInt(weekIndex)
        const parsedDayIndex = parseInt(dayIndex)
        const cellDate = weeks[parsedWeekIndex][parsedDayIndex]
		setDragTicketId(ticketId)
        setDragCellIndex([parsedWeekIndex, parsedDayIndex])
		// if the calendar does not contain this ticket, OR it does exist but has a different date, 
        // we can add it
        const existingTicketWithDate = calendarData.find(data => 
            data.type === "Ticket" && 
            data.id === ticketId &&
            isEqual(data.endDate, cellDate)
        )
        const toast: Toast = {
            id: uuidv4(),
            animationType: "animation-in",
            message: "Due date set successfully!",
            type: "success"
        }
        if (!existingTicketWithDate){
            try {
                await updateTicketDueDate({ticketId, dueDate: cellDate.toISOString().split("T")[0]}).unwrap()
                dispatch(addToast(toast))
            }
            catch (e){ 
                dispatch(addToast({
                    ...toast,
                    type: "failure",
                    message: "Something went wrong while updating ticket"
                }))
            }
        }
		setDragTicketId(null)
        setDragCellIndex([])
	}

    return (
        <div className="tw-flex tw-flex-col tw-gap-y-4 lg:tw-flex-row lg:tw-gap-x-6 tw-py-4">
            <div className={`${TABLE_BACKGROUND} tw-flex-1 tw-rounded-lg tw-border tw-flex tw-flex-col tw-gap-y-4`}>
                {/* Header */}
                <div className = "tw-flex tw-flex-col tw-gap-y-2 tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <h2 className={`${PRIMARY_TEXT} tw-text-xl tw-font-semibold`}>
                            {generateHeader()}
                        </h2>
                        <PaginationButtonRow
                            nextHandler={() => changeMonth(1)}
                            prevHandler={() => changeMonth(-1)}
                            isDisabledPrev={false}
                            isDisabledNext={false}
                        />
                    </div>
                    <FormProvider {...methods}>
                        <CalendarContainerSearchBar
                            onSubmit={onSubmit}
                            numFilters={numFilters}
                            boardId={boardId}
                            isWeekView={isWeekView}
                            viewOption={viewOption}
                            setViewOption={setViewOption}
                        />
                    </FormProvider>
                </div>

                {/* Days of week header */}
                <div className = "tw-border-t">
                    <div className="tw-grid tw-grid-cols-7 tw-border-b">
                        { daysOfWeek.map(day => (
                            <div key={day} className={`tw-p-3 tw-text-center tw-text-sm tw-font-medium ${SECONDARY_TEXT} tw-border-r last:tw-border-r-0`}>
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
                                    <div className={`tw-grid tw-grid-cols-7 ${isWeekView ? "tw-min-h-96" : "tw-min-h-32"}`}>
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
                                                    key={`date_${weekIndex}_${dayIndex}`}
                                                    id = {`date_${weekIndex}_${dayIndex}`} 
                                                    onDrop={handleDrop} 
                                                    onDragOver={enableDropping} 
                                                    className={`${CELL_HOVER} tw-cursor-pointer tw-flex tw-flex-col tw-relative tw-border-r last:tw-border-r-0 tw-p-2 tw-min-h-32 ${
                                                        !isCurrentMonth(date) ? CELL_BACKGROUND : ''
                                                    }`}
                                                    onClick={(e) => {
                                                        if (e.defaultPrevented){
                                                            return
                                                        }
                                                        dispatch(setModalProps({
                                                            boardId,
                                                            statusesToDisplay,
                                                            dueDate: date.toISOString().split("T")[0]
                                                        }))
                                                        dispatch(setModalType("ADD_TICKET_FORM"))
                                                        dispatch(toggleShowModal(true))
                                                    }}
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
                                                            ? 'dark:tw-text-gray-900 tw-text-gray-400'
                                                            // default text if not today's date AND not outside the current month
                                                            : SECONDARY_TEXT
                                                    }`}>
                                                        {format(date, 'd')}
                                                    </div>
                                                    {
                                                        dragCellIndex[0] === weekIndex && dragCellIndex[1] === dayIndex ?
                                                        <div className = {`tw-absolute tw-top-0 tw-right-0 tw-mr-1 tw-mt-1`}>
                                                            <LoadingSpinner/>
                                                        </div>
                                                        : null
                                                    }

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
                                                                <div 
                                                                    className = {`${getTicketColor(ticket)} tw-rounded tw-px-2 tw-py-1 tw-font-medium tw-text-xs tw-flex tw-items-center tw-w-full tw-text-left`}
                                                                    draggable
                                                                    onDragStart={dragStart}
                                                                    key={`to_update_ticket_${ticket.id}`}
                                                                    id={`to_update_ticket_${ticket.id}`}
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        dispatch(toggleShowModal(true))
                                                                        dispatch(setModalType("EDIT_TICKET_FORM"))
                                                                        dispatch(selectCurrentTicketId(ticket.id))
                                                                    }}
                                                                >
                                                                    <span className="tw-mr-1"><IconTicket/></span>
                                                                    <span className="tw-truncate">{ticket.name}</span>
                                                                </div>
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
            <div className = {`${TABLE_BACKGROUND} tw-flex lg:tw-w-1/3 tw-flex-col tw-gap-y-4 tw-border tw-rounded-lg tw-bg-white tw-p-4`}>
                <p className = {`${PRIMARY_TEXT} tw-font-semibold tw-text-lg`}>Unscheduled Tickets</p>
                <p className = {SECONDARY_TEXT}>
                    {width >= LG_BREAKPOINT ? "Drag the ticket onto the calendar to set a due date for the ticket." : "Click on a ticket to assign a due date." }
                </p>
                <div className = "tw-flex tw-flex-col tw-gap-y-1">
                {
                    unscheduledTickets?.data?.map((ticket) => {
                        return (
                            <div 
                                key={`to_update_ticket_${ticket.id}`}
                                id={`to_update_ticket_${ticket.id}`}
                                draggable
                                onDragStart={dragStart}
                                onClick={(e) => {
                                if (dragTicketId === ticket.id && isLoading){
                                    return
                                }
                                dispatch(setModalType("EDIT_TICKET_FORM"))
                                dispatch(selectCurrentTicketId(ticket.id))
                                dispatch(toggleShowModal(true))
                            }}><TicketRow isLoadingState={isLoading && dragTicketId === ticket.id} hideProfilePicture={width >= LG_BREAKPOINT} ticket={ticket}/></div>
                        )
                    })
                }
                </div>
                {
                    unscheduledTickets?.pagination.nextPage || unscheduledTickets?.pagination.prevPage ? 
                    <PaginationRow
                        paginationData={unscheduledTickets?.pagination}
                        setPage={setUnscheduledTicketsPage}
                        currentPage={unscheduledTicketsPage}
                        showPageNums={true}
                    /> : null
                }
            </div>
        </div>
    )
}

