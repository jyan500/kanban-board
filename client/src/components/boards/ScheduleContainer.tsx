import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { GroupByOptionsKey } from "../../types/common"
import { IconArrowRight } from "../../components/icons/IconArrowRight"
import { IconArrowLeft } from "../../components/icons/IconArrowLeft"
import { GROUP_BY_OPTIONS } from "../../helpers/constants"
import { IconCalendar } from "../../components/icons/IconCalendar"
import { IconClock } from "../../components/icons/IconClock"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Ticket, ViewMode } from "../../types/common"
import { 
    startOfWeek, 
    endOfWeek, 
    differenceInMilliseconds,
    isBefore, 
    isAfter, 
    eachDayOfInterval, 
    format,
    subWeeks, 
    addWeeks, 
    subMonths, 
    addMonths
} from "date-fns"
import { setGroupBy } from "../../slices/boardSlice" 
import { ScheduleContainerRows } from "./ScheduleContainerRows"
import { Button } from "../../components/page-elements/Button"
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"
import { setFilters } from '../../slices/boardFilterSlice'

interface Props {
    currentDate: Date
    periodStart: Date
    periodEnd: Date
    viewMode: ViewMode
    setCurrentDate: (date: Date) => void
    setViewMode: (mode: ViewMode) => void
    tickets?: Array<Ticket>
}

export const GanttChart = ({ 
    tickets = [], 
    currentDate,
    setCurrentDate,
    periodStart, 
    periodEnd, 
    setViewMode, 
    viewMode, 
}: Props) => {
    const dispatch = useAppDispatch()
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
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-flex tw-items-center">
                        <IconCalendar className="tw-w-6 tw-h-6 tw-mr-2" />
                        Gantt Chart
                    </h2>
                    <div className="tw-text-sm tw-text-gray-600 tw-flex tw-items-center">
                        <IconClock className="tw-w-6 tw-h-6 tw-mr-1"/>
                        {tickets.length} tasks visible
                    </div>
                </div>
                
                {/* Controls */}
                <div className="tw-flex tw-items-center tw-justify-between">
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

                    <div className="tw-flex tw-items-center tw-space-x-2">
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
                    <div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
                        <Button
                            onClick={() => setCurrentDate(new Date())}
                            theme={"primary"}
                        >
                            Today
                        </Button>
                        <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                            <label className = "label" htmlFor="board-group-by">Group By</label>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div>
                {/* <div className="tw-min-w-[800px] tw-border-b tw-border-gray-200">
                    <div className="tw-flex tw-flex-row tw-items-center">
                        <div className="tw-w-48 tw-p-3 tw-font-medium tw-text-gray-700 tw-border-r tw-border-gray-200">
                            {groupBy === "NONE" ? "Tasks" : GROUP_BY_OPTIONS[groupBy as GroupByOptionsKey]}
                        </div>
                        <div className="tw-overflow-x-auto tw-flex-1 tw-flex">
                            {timeColumns.map((date, index) => (
                                <div
                                    key={index}
                                    className="tw-flex-1 tw-p-2 tw-text-center tw-text-sm tw-font-medium tw-text-gray-600 tw-border-r tw-border-gray-200 tw-min-w-[60px]"
                                >
                                    {formatDate(date)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div> */}
                <div className = "tw-overflow-x-auto">
                    {/* Task rows */}
                    <ScheduleContainerRows 
                        viewMode={viewMode} 
                        periodEnd={periodEnd} 
                        currentDate={currentDate}
                        periodStart={periodStart} 
                        tickets={tickets}
                    />
                </div>
            </div>
        </div>
    )
}
