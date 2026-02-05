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
import { IconTicket } from '../icons/IconTicket'
import { GROUP_BY_OPTIONS, PRIMARY_TEXT, SEARCH_OPTIONS, SECONDARY_TEXT, STANDARD_BORDER_COLOR, STANDARD_HOVER, TABLE_BACKGROUND, TABLE_DIVIDE } from "../../helpers/constants"
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
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { PaginationRow } from "../page-elements/PaginationRow"
import { LoadingSkeleton } from '../page-elements/LoadingSkeleton'
import { RowPlaceholder } from '../placeholders/RowPlaceholder'
import { useScreenSize } from "../../hooks/useScreenSize"
import { LG_BREAKPOINT } from "../../helpers/constants"
import { SearchToolBar } from "../tickets/SearchToolBar"
import { BoardFilterForm } from "../forms/BoardFilterForm"
import { useClickOutside } from "../../hooks/useClickOutside"
import { useForm, FormProvider, useFormContext} from "react-hook-form"
import { FormValues } from "../../pages/boards/BoardSchedule"
import { IconFilter } from "../icons/IconFilter"
import { FilterButton } from "../../components/page-elements/FilterButton"
import { Select } from "../page-elements/Select"
import { Label } from '../page-elements/Label'
import { ArrowButton } from '../page-elements/ArrowButton'

interface TicketDescriptionProps {
    ticket: Ticket
    openModal: (ticketId: number) => void
}

const TicketDescription = ({ticket, openModal}: TicketDescriptionProps) => {
    return (
        <button onClick={(e) => openModal(ticket.id)} className="hover:tw-opacity-60 tw-w-full tw-h-16 tw-p-3">
            <div className={`${SECONDARY_TEXT} tw-font-medium tw-text-sm tw-truncate`}>
                {ticket.name}
            </div>
            <div className={`${SECONDARY_TEXT} tw-text-xs`}>
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
        <div className={`tw-w-44 lg:tw-w-48 tw-flex-shrink-0 tw-border-r ${STANDARD_BORDER_COLOR}`}>
            <div className={`tw-p-3 tw-flex tw-flex-row tw-justify-between tw-font-medium tw-text-gray-700 tw-h-12 tw-border-b ${STANDARD_BORDER_COLOR}`}>
                <span className={SECONDARY_TEXT}>{groupBy === "NONE" ? "Tasks" : GROUP_BY_OPTIONS[groupBy as GroupByOptionsKey]}</span>
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
            <div className={TABLE_DIVIDE}>
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
                                <div key={`group-by-${groupByElement?.name}-${groupById}`} className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-p-3 tw-h-16 tw-font-medium tw-text-gray-800 tw-bg-gray-50 tw-text-sm tw-truncate">
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
        <div className={`tw-flex tw-flex-row tw-border-b ${STANDARD_BORDER_COLOR}`}>
            {timeColumns.map((date, index) => (
                <div
                    key={index}
                    className={`tw-flex-1 tw-h-12 tw-p-2 tw-text-center tw-text-sm tw-font-medium ${SECONDARY_TEXT} tw-border-r last:tw-border-r-0 ${STANDARD_BORDER_COLOR} tw-min-w-[60px]`}
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
        <div key={`bar-${ticket.id}`} className={`tw-relative tw-h-16 tw-flex tw-items-center ${STANDARD_HOVER}`}>
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
                className={`${isBefore(ticket.dueDate, new Date()) ? "tw-bg-red-300" : "tw-bg-blue-300"} hover:tw-opacity-80 tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-medium tw-shadow-sm`}
                style={{
                    left: position.left,
                    width: position.width,
                    minWidth: '2px'
                }}
            >
                <IconTicket/>
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
                <div className={TABLE_DIVIDE}>
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
            <ArrowButton onClick={navigatePrev}></ArrowButton>
            <span className={`${SECONDARY_TEXT} tw-text-lg tw-font-medium tw-min-w-[200px] tw-text-center`}>
                {getCurrentPeriodLabel()}
            </span>
            <ArrowButton
                onClick={navigateNext}
                isForward={true}
            >
            </ArrowButton>
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
    numFilters: number
    onGroupBy: (option: GroupByOptionsKey) => void
    boardId: number
}

const ScheduleContainerSearchBar = ({
    pagination,
    setPage,
    currentPage,
    onSubmit,
    groupBy,
    numFilters,
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
                    searchOptions = {SEARCH_OPTIONS}
                    additionalButtons={
                    () => {
                        return (
                            <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                                <Label className = "tw-whitespace-nowrap" htmlFor="board-group-by">Group By</Label>
                                <div className={"!tw-mt-0 !tw-w-40"}>
                                    <Select
                                        id="board-group-by"
                                        options={Object.keys(GROUP_BY_OPTIONS).map((option) => ({
                                            label: GROUP_BY_OPTIONS[option as keyof typeof GROUP_BY_OPTIONS],
                                            value: option
                                        }))}
                                        className={"!tw-bg-primary lg:!tw-w-auto"}
                                        textColor={"white"}
                                        textAlign={"center"}
                                        clearable={false}
                                        defaultValue={{value: groupBy, label: GROUP_BY_OPTIONS[groupBy as keyof typeof GROUP_BY_OPTIONS]}}
                                        onSelect={(selectedOption: {label: string, value: string} | null) => {
                                            if (selectedOption){
                                                onGroupBy(selectedOption.value as GroupByOptionsKey)
                                            }
                                        }}
                                    >
                                    </Select>
                                </div>
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
    numFilters: number
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
    viewMode, 
    onSubmit,
    numFilters,
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
        <div className={`tw-w-full ${TABLE_BACKGROUND} tw-rounded-lg tw-shadow-lg`}>
            {/* Header */}
            <div className={`tw-p-4 tw-border-b ${STANDARD_BORDER_COLOR}`}>
                <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-y-2 lg:tw-items-center lg:tw-justify-between tw-mb-4">
                    <FormProvider {...methods}>
                        <ScheduleContainerSearchBar
                            setPage={setPage}
                            numFilters={numFilters}
                            currentPage={currentPage}
                            boardId={boardId}
                            pagination={ticketsData.pagination ?? {}}
                            onSubmit={onSubmit}
                            groupBy={groupBy}
                            onGroupBy={onGroupBy}
                        />
                    </FormProvider>
                    <div className="tw-text-sm  tw-flex tw-gap-x-2 tw-items-center">
                        <IconClock className={`${PRIMARY_TEXT} tw-flex-shrink-0 tw-w-6 tw-h-6`}/>
                        <span className={`${SECONDARY_TEXT} tw-whitespace-nowrap`}>{tickets.length} tasks visible ({ticketsData?.pagination?.total} total)</span>
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
