import React, { useState, useEffect, useMemo } from 'react'
import { ScheduleTask } from "../../types/common"
import { IconArrowRight } from "../../components/icons/IconArrowRight"
import { IconArrowLeft } from "../../components/icons/IconArrowLeft"
import { IconCalendar } from "../../components/icons/IconCalendar"
import { IconClock } from "../../components/icons/IconClock"
import { ViewMode } from "../../types/common"
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
import { setFilters } from '../../slices/boardFilterSlice'

interface Props {
    currentDate: Date
    periodStart: Date
    periodEnd: Date
    viewMode: ViewMode
    setCurrentDate: (date: Date) => void
    setViewMode: (mode: ViewMode) => void
    tasks?: Array<ScheduleTask>
}

export const GanttChart = ({ 
    tasks = [], 
    currentDate,
    setCurrentDate,
    periodStart, 
    periodEnd, 
    setViewMode, 
    viewMode, 
}: Props) => {
    // Calculate task bar position and width
    const calculateTaskPosition = (task: ScheduleTask) => {
        const taskStart = new Date(task.startDate)
        const taskEnd = new Date(task.endDate)
        
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
                        {tasks.length} tasks visible
                    </div>
                </div>
                
                {/* Controls */}
                <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center tw-space-x-2">
                        {(['week', 'month'] as ViewMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`tw-px-3 tw-py-1 tw-rounded-md tw-text-sm tw-font-medium tw-transition-colors ${
                                    viewMode === mode
                                        ? 'tw-bg-blue-100 tw-text-blue-700'
                                        : 'tw-bg-gray-100 tw-text-gray-600 hover:tw-bg-gray-200'
                                }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
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

                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="tw-px-3 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded-md hover:tw-bg-blue-600 tw-transition-colors tw-text-sm"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="tw-overflow-x-auto">
                <div className="tw-min-w-[800px]">
                    {/* Time header */}
                    <div className="tw-flex tw-border-b tw-border-gray-200 tw-bg-gray-50">
                        <div className="tw-w-48 tw-p-3 tw-font-medium tw-text-gray-700 tw-border-r tw-border-gray-200">
                            Tasks
                        </div>
                        <div className="tw-flex-1 tw-flex">
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

                    {/* Task rows */}
                    <div className="tw-divide-y tw-divide-gray-100">
                        {tasks.length === 0 ? (
                            <div className="tw-p-8 tw-text-center tw-text-gray-500">
                                No tasks found for the current {viewMode} period
                            </div>
                        ) : (
                            tasks.map(task => {
                                const position = calculateTaskPosition(task)
                                return (
                                    <div key={task.id} className="tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
                                        <div className="tw-w-48 tw-p-3 tw-border-r tw-border-gray-200">
                                            <div className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
                                                {task.name}
                                            </div>
                                            <div className="tw-text-xs tw-text-gray-500">
                                                {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="tw-flex-1 tw-relative tw-h-12 tw-flex tw-items-center">
                                            <div
                                                className="tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    backgroundColor: task.color || '#3B82F6',
                                                    minWidth: '2px'
                                                }}
                                            >
                                                {parseFloat(position.width) > 10 && (
                                                    <span className="tw-truncate tw-px-2">{task.name}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
