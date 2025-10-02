import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { 
    GenericObject, 
    GroupByOptionsKey, 
    GroupByElement, 
    Ticket, 
    TicketType, 
    ViewMode, 
    ListResponse, 
    IPagination 
} from "../../types/common"
import { IconArrowRight } from "../icons/IconArrowRight"
import { IconArrowLeft } from "../icons/IconArrowLeft"
import { IconArrowDown } from "../icons/IconArrowDown"
import { IconArrowUp } from "../icons/IconArrowUp"
import { GROUP_BY_OPTIONS } from "../../helpers/constants"
import { IconCalendar } from "../icons/IconCalendar"
import { IconClock } from "../icons/IconClock"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
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
import { setGroupBy } from "../../slices/boardSlice" 
import { applyGroupModifier } from "../../helpers/groupBy"
import { Button } from "../../components/page-elements/Button"
import { useGetGroupByElementsQuery } from "../../services/private/groupBy"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"
import { setFilters } from '../../slices/boardFilterSlice'
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { PaginationRow } from "../page-elements/PaginationRow"
import { LoadingSkeleton } from '../page-elements/LoadingSkeleton'
import { RowPlaceholder } from '../placeholders/RowPlaceholder'
import { useScreenSize } from "../../hooks/useScreenSize"
import { LG_BREAKPOINT } from "../../helpers/constants"
import { SearchToolBar } from "../tickets/SearchToolBar"
import { BoardScheduleFilterForm } from "../forms/BoardScheduleFilterForm"
import { useClickOutside } from "../../hooks/useClickOutside"
import { useForm, FormProvider, useFormContext} from "react-hook-form"
import { FormValues } from "../../pages/boards/BoardSchedule"
import { IconFilter } from "../icons/IconFilter"

interface TicketDescriptionProps {
    ticket: Ticket
    openModal: (ticketId: number) => void
}

const TicketDescription = ({ticket, openModal}: TicketDescriptionProps) => {
    return (
        <button onClick={(e) => openModal(ticket.id)} className="hover:tw-opacity-60 tw-w-full tw-h-16 tw-p-3">
            <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
                {ticket.name}
            </div>
            <div className="tw-text-xs tw-text-gray-500">
                {new Date(ticket.createdAt).toLocaleDateString()} - {new Date(ticket.dueDate).toLocaleDateString()}
            </div>
        </button>
    )
}

interface ScheduleContainerLeftColumnProps {
    groupBy: string
    openModal: (ticketId: number) => void
    groupByElements?: Array<GenericObject>
    tickets: Array<Ticket>
    groupedTickets: Record<string, Array<Ticket>>
    collapseArrows: Record<string, boolean>
    setCollapseArrows: (collapseArrows: Record<string, boolean>) => void
    pagination: IPagination
    setPage: (page: number) => void
    currentPage: number
}

export const ScheduleContainerLeftColumn = ({
    groupBy, 
    openModal,
    groupedTickets, 
    groupByElements=[],
    setCollapseArrows, 
    collapseArrows,
    tickets,
    pagination,
    setPage,
    currentPage,
}: ScheduleContainerLeftColumnProps) => {
    return (
        <div className="tw-w-44 lg:tw-w-48 tw-flex-shrink-0 tw-border-r tw-border-gray-200">
            <div className="tw-p-3 tw-flex tw-flex-row tw-justify-between tw-font-medium tw-text-gray-700 tw-h-12 tw-border-b tw-border-gray-200">
                <span>{groupBy === "NONE" ? "Tasks" : GROUP_BY_OPTIONS[groupBy as GroupByOptionsKey]}</span>
                {
                    pagination.nextPage || pagination.prevPage ? 
                        <PaginationRow
                            currentPage={currentPage}
                            showPageNums={false}
                            setPage={setPage}
                            paginationData={pagination}
                        />
                    : null
                }
            </div>
            <div className="tw-divide-y tw-divide-gray-100">
                {groupBy === "NONE" ? (
                    tickets.map((ticket) => (
                        <div key={`ticket-description-${ticket.id}`}>
                            <TicketDescription openModal={openModal} ticket={ticket}/>
                        </div>
                    ))
                )
                : (
                    Object.keys(groupedTickets).map((groupById: string) => {
                        const groupByElement = groupByElements?.find((element: GroupByElement) => element.id === parseInt(groupById))
                        return (
                            <>
                                <div key={`group-by-${groupByElement}-${groupById}`} className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-p-3 tw-h-16 tw-font-medium tw-text-gray-800 tw-bg-gray-50 tw-text-sm tw-truncate">
                                    <button className = "hover:tw-opacity-60" onClick={() => {
                                        setCollapseArrows({...collapseArrows, [groupById]: !collapseArrows[groupById]})
                                    }}>
                                        <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                                            <span className = "tw-w-32 tw-truncate">{groupByElement?.name}</span>
                                            {collapseArrows[groupById] ? <IconArrowUp /> : <IconArrowDown />}
                                        </div>
                                    </button>
                                </div>
                                {
                                    !collapseArrows[groupById] ? 
                                    groupedTickets[groupById].map((ticket, index) => {
                                        return (
                                            <div key={`grouped-ticket-description-${ticket.id}`}>
                                                <TicketDescription openModal={openModal} ticket={ticket}/>
                                            </div>
                                        )
                                    }) : null
                                }
                            </>
                        )
                    })
                )
                }
            </div>
           
        </div>
    )
}

interface ScheduleContainerTimeColumnProps {
    timeColumns: Array<Date>
    viewMode: string
}

const ScheduleContainerTimeColumns = ({viewMode, timeColumns}: ScheduleContainerTimeColumnProps) => {
    // Format date for display
    const formatDate = (date: Date) => {
        if (viewMode === 'week') {
            return format(date, 'EEE d') // e.g., "Mon 23"
        } else {
            return format(date, 'd') // e.g., "23"
        }
    }
    return (
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
    )
}

interface ScheduleContainerRowTicketProps {
    ticket: Ticket
    position: {left: string, width: string}
    ticketType: string 
    openModal: (ticketId: number) => void
}

const ScheduleContainerRowTicket = ({openModal, ticket, position, ticketType}: ScheduleContainerRowTicketProps) => {
    const dispatch = useAppDispatch()

    return (
        <div key={`bar-${ticket.id}`} className="tw-relative tw-h-16 tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
            {/* Invisible column structure to maintain width. (Not sure if this is actually necessary so keeping as a comment) */}
            {/* <div className="tw-flex tw-flex-row tw-w-full">
                {timeColumns.map((date, index) => (
                    <div
                        key={index}
                        className="tw-flex-1 tw-min-w-[60px]"
                    />
                ))}
            </div> */}
            {/* Absolutely positioned task bar */}
            <button
                onClick={(e) => openModal(ticket.id)}
                className="hover:tw-opacity-70 tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
                style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: TICKET_TYPE_COLOR_MAP[ticketType as keyof typeof TICKET_TYPE_COLOR_MAP] || '#3B82F6',
                    minWidth: '2px'
                }}
            >
                <span className="tw-truncate tw-px-2">{ticket.name}</span>
            </button>
        </div>
    )
}

interface ScheduleContainerScrollableSectionProps {
    viewMode: string
    periodStart: Date
    periodEnd: Date
    groupBy: string
    groupByElements?: Array<GenericObject>
    timeColumns: Array<Date>
    tickets: Array<Ticket>
    groupedTickets: Record<string, Array<Ticket>>
    ticketTypes: Array<TicketType>
    collapseArrows: Record<string, boolean>
    openModal: (ticketId: number) => void
}

const ScheduleContainerScrollableSection = ({
    periodStart,
    openModal, 
    periodEnd,
    groupBy,
    tickets,
    groupByElements=[],
    groupedTickets,
    timeColumns,
    ticketTypes,
    viewMode,
    collapseArrows,
}: ScheduleContainerScrollableSectionProps) => {
    
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
        <div className="tw-flex-1 tw-overflow-x-auto">
            {/* 
                wrapping both the time columns and ticket sections in
                min-w-max allows the header + taskbar width calculations to account for the full width needed, including the amount the user needs to scroll if overflow is triggered 
                This also fixes issues with styling and coloring not extending past the scroll.
            */}
            <div className="tw-min-w-max">
                <ScheduleContainerTimeColumns viewMode={viewMode} timeColumns={timeColumns}/>
                {/* Task bar rows */}
                <div className="tw-divide-y tw-divide-gray-100">
                    {groupBy === "NONE" ? 
                        (
                            tickets.map((ticket) => {
                                const position = calculateTaskPosition(ticket)
                                const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
                                return (
                                    <div key={`scheduler-row-ticket-${ticket.id}`}>
                                        <ScheduleContainerRowTicket openModal={openModal} ticket={ticket} ticketType={ticketType} position={position}/>
                                    </div>
                                )
                        })
                    ) : (
                        Object.keys(groupedTickets).map((groupById: string) => {
                            const groupByElement = groupByElements?.find((element: GroupByElement) => element.id === parseInt(groupById))
                            return (
                                <>
                                    {/* add one empty row to account for the group by header on the left column */}
                                    <div key={`groupby-${groupById}`} className="tw-relative tw-h-16 tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
                                    </div>
                                    {
                                        groupedTickets[groupById].map((ticket, index) => {
                                            const position = calculateTaskPosition(ticket)
                                            const ticketType = ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name ?? ""
                                            if (collapseArrows[groupById]) {
                                                return null;
                                            }
                                            return (
                                                <div key={`grouped-scheduler-row-ticket=${ticket.id}`}>
                                                    <ScheduleContainerRowTicket openModal={openModal} ticket={ticket} ticketType={ticketType} position={position}/>
                                                </div>
                                            )
                                        })
                                    }
                                </>
                            )
                        })
                    ) 
                    }
                </div>
            </div>
        </div>
    )
}

interface SchedulerContainerControlsProps {
    viewMode: ViewMode
    setViewMode: (mode: ViewMode) => void
    currentDate: Date
    setCurrentDate: (date: Date) => void
    navigatePrev: () => void
    navigateNext: () => void
    getCurrentPeriodLabel: () => string
    groupBy: string
    groupByOptions: Record<string, string>
    onGroupBy: (option: GroupByOptionsKey) => void
}

const ScheduleContainerControls = ({
    viewMode, 
    setViewMode, 
    currentDate, 
    setCurrentDate, 
    navigatePrev, 
    navigateNext, 
    getCurrentPeriodLabel,
    groupBy,
    groupByOptions,
    onGroupBy,
}: SchedulerContainerControlsProps) => {
    const { width, height } = useScreenSize()

    const navigationButtons = (
        <div className="tw-flex tw-items-center tw-gap-x-2">
            <button
                onClick={navigatePrev}
                className="tw-p-1 tw-rounded-md hover:tw-bg-gray-100 tw-transition-colors"
            >
                <IconArrowLeft className = "tw-w-6 tw-h-6"/>
            </button>
            <span className="tw-text-lg tw-font-medium tw-min-w-[200px] tw-text-center">
                {getCurrentPeriodLabel()}
            </span>
            <button
                onClick={navigateNext}
                className="tw-p-1 tw-rounded-md hover:tw-bg-gray-100 tw-transition-colors"
            >
                <IconArrowRight className = "tw-w-6 tw-h-6"/>
            </button>
        </div>
    )

    const rightSideButtons = (
        <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
            <div>
                <Button
                    onClick={() => setCurrentDate(new Date())}
                    theme={"primary"}
                >
                    Today
                </Button>
            </div>

        </div>
    )

    const modeChangeButtons = (
        <div className="tw-flex tw-items-center tw-space-x-2">
            {(['week', 'month'] as ViewMode[]).map(mode => (
                <Button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    theme={viewMode === mode ? "active" : "secondary"}
                >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
            ))}
        </div>
    )

    return (
        <>
        {
            width <= LG_BREAKPOINT ? (
                <div className="tw-flex tw-flex-col tw-gap-y-4 tw-items-center">
                    {navigationButtons}
                    <div className = "tw-flex tw-flex-row tw-gap-x-4 tw-justify-between tw-items-center">
                        {modeChangeButtons} 
                        {rightSideButtons}
                    </div>
                </div>
            ) : (
                <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
                    {modeChangeButtons}
                    {navigationButtons}
                    {rightSideButtons} 
                </div>
            )
        }
        </>
    )
}


interface ScheduleContainerSearchBarProps { 
    pagination: IPagination
    setPage: (page: number) => void
    currentPage: number
    onSubmit: (values: FormValues) => void
    groupBy: string
    filterButtonState: boolean
    onGroupBy: (option: GroupByOptionsKey) => void
    boardId: number
}

const ScheduleContainerSearchBar = ({
    pagination,
    setPage,
    currentPage,
    onSubmit,
    groupBy,
    filterButtonState,
    onGroupBy,
    boardId,
}: ScheduleContainerSearchBarProps) => {
    const dispatch = useAppDispatch()
    const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods
    return (
        <div className = "tw-flex tw-flex-col tw-gap-y-2 sm:tw-w-full lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
            <FormProvider {...methods}>
                <SearchToolBar 
                    paginationData={pagination} 
                    setPage={setPage} 
                    currentPage={currentPage}
                    registerOptions={{}}
                    searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
                    additionalButtons={
                    () => {
                        return (
                            <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                                <label className = "label tw-whitespace-nowrap" htmlFor="board-group-by">Group By</label>
                                <select 
                                    id = "board-group-by" 
                                    /* TODO: the margin top is coming from label CSS, need to refactor to make separate horizontal label class rather than
                                    forcing the margin top to 0 here */
                                    className = "__custom-select tw-bg-primary tw-border-primary tw-w-full !tw-mt-0 lg:tw-w-auto" 
                                    value={groupBy}
                                    onChange={(e) => onGroupBy(e.target.value as GroupByOptionsKey)}>
                                    {
                                        Object.keys(GROUP_BY_OPTIONS).map((groupByKey) => (
                                            <option key={`group_by_${groupByKey}`} value = {groupByKey}>{GROUP_BY_OPTIONS[groupByKey as GroupByOptionsKey]}</option>
                                        ))
                                    }
                                </select>
                                <div className = "tw-relative tw-group">
                                    <Button onClick={() => {
                                        dispatch(setModalType("BOARD_FILTER_MODAL"))
                                        dispatch(setModalProps({type: "SCHEDULE", boardId: boardId}))
                                        dispatch(toggleShowModal(true))
                                    }} className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200 tw-bg-white hover:tw-bg-gray-50 tw-text-gray-700">
                                        <div className = "tw-flex tw-flex-row tw-gap-x-2">
                                            <IconFilter className = {`${filterButtonState ? "tw-text-primary" : ""}`}/>
                                            <span>Filters</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                    }
                    onFormSubmit={async () => {
                        await handleSubmit(onSubmit)()
                    }}
                    hidePagination={true}
                >
                </SearchToolBar>
            </FormProvider>

        </div>
    )
}

interface ScheduleContainerProps {
    currentDate: Date
    periodStart: Date
    periodEnd: Date
    viewMode: ViewMode
    setCurrentDate: (date: Date) => void
    setPage: (page: number) => void
    currentPage: number
    setViewMode: (mode: ViewMode) => void
    ticketsData?: ListResponse<Ticket> 
    isTicketsLoading?: boolean
    filterButtonState: boolean
    onSubmit: (values: FormValues) => void
    boardId: number
}

export const ScheduleContainer = ({ 
    ticketsData = {} as ListResponse<Ticket>, 
    currentDate,
    setCurrentDate,
    periodStart, 
    periodEnd, 
    currentPage,
    setViewMode, 
    setPage,
    filterButtonState,
    viewMode, 
    onSubmit,
    boardId,
    isTicketsLoading=false,
}: ScheduleContainerProps) => {
    const dispatch = useAppDispatch()
    const tickets = ticketsData?.data ?? []
    const { groupBy } = useAppSelector((state) => state.board)
    const { ticketTypes } = useAppSelector((state) => state.ticketType)
    const groupedTickets = groupBy !== "NONE" ? applyGroupModifier(groupBy, tickets) : {}
	const {data: groupByElements, isLoading, isError} = useGetGroupByElementsQuery(groupBy !== "NONE" ? {groupBy: groupBy, ids: Object.keys(groupedTickets)} : skipToken)  
    const [collapseArrows, setCollapseArrows] = useState<Record<string, boolean>>(
		Object.keys(groupedTickets).reduce((acc: Record<string, boolean>, key: string) => {
		acc[key] = false
		return acc
	}, {}))
    const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods
    const openModal = (ticketId: number) => {
        dispatch(toggleShowModal(true))
        dispatch(setModalType("EDIT_TICKET_FORM"))
        dispatch(selectCurrentTicketId(ticketId))
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

    const navigatePrev = () => {
        const actions = {
            week: () => subWeeks(currentDate, 1),
            month: () => subMonths(currentDate, 1)
        }
        setCurrentDate(actions[viewMode]())
    }

    const navigateNext = () => {
        const actions = {
            week: () => addWeeks(currentDate, 1),
            month: () => addMonths(currentDate, 1)
        }
        setCurrentDate(actions[viewMode]())
    }

    const onGroupBy = (option: GroupByOptionsKey) => {
		dispatch(setGroupBy(option))
	}


    return (
        <div className="tw-w-full tw-bg-white tw-rounded-lg tw-shadow-lg">
            {/* Header */}
            <div className="tw-p-4 tw-border-b tw-border-gray-200">
                <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-y-2 lg:tw-items-center lg:tw-justify-between tw-mb-4">
                    <FormProvider {...methods}>
                        <ScheduleContainerSearchBar
                            setPage={setPage}
                            currentPage={currentPage}
                            boardId={boardId}
                            pagination={ticketsData.pagination ?? {}}
                            onSubmit={onSubmit}
                            groupBy={groupBy}
                            onGroupBy={onGroupBy}
                            filterButtonState={filterButtonState}
                        />
                    </FormProvider>
                    <div className="tw-text-sm tw-text-gray-600 tw-flex tw-gap-x-2 tw-items-center">
                        <IconClock className="tw-flex-shrink-0 tw-w-6 tw-h-6"/>
                        <span className="tw-whitespace-nowrap">{tickets.length} tasks visible ({ticketsData?.pagination?.total} total)</span>
                    </div>
                </div>
                
                {/* Controls */}
                <ScheduleContainerControls 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    navigatePrev={navigatePrev}
                    navigateNext={navigateNext}
                    getCurrentPeriodLabel={getCurrentPeriodLabel}
                    groupBy={groupBy}
                    groupByOptions={GROUP_BY_OPTIONS}
                    onGroupBy={onGroupBy}
                />
            </div>

            {/* Chart */}
            <div>
                <div className = "tw-overflow-x-auto">
                    {/* Task rows */}
                    <div className="tw-flex tw-flex-col">
                        {tickets.length === 0 ? (
                            <div className="tw-p-8 tw-text-center tw-text-gray-500">
                                {
                                    isTicketsLoading ? 
                                        <LoadingSkeleton height="tw-h-[800px]" width="tw-w-full">
                                            <RowPlaceholder/>	
                                        </LoadingSkeleton> :
                                    <span>No tasks found for the current {viewMode} period</span>
                                }
                            </div>
                        ) : (
                            <div className="tw-flex tw-flex-row">
                                {/* Fixed left column for task names */}
                                <ScheduleContainerLeftColumn
                                    groupBy={groupBy}
                                    setPage={setPage}
                                    pagination={ticketsData.pagination}
                                    currentPage={currentPage}
                                    collapseArrows={collapseArrows}
                                    setCollapseArrows={setCollapseArrows}
                                    tickets={tickets}
                                    groupedTickets={groupedTickets}
                                    groupByElements={groupByElements}
                                    openModal={openModal}
                                /> 
                
                                {/* Scrollable section with header and task bars */}
                                <ScheduleContainerScrollableSection
                                    openModal={openModal}
                                    tickets={tickets}
                                    groupBy={groupBy}
                                    ticketTypes={ticketTypes}
                                    groupByElements={groupByElements}
                                    viewMode={viewMode}
                                    periodStart={periodStart}
                                    periodEnd={periodEnd}
                                    timeColumns={timeColumns}
                                    groupedTickets={groupedTickets}
                                    collapseArrows={collapseArrows}
                                /> 
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
